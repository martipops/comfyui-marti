"""Resolves model links and runs downloads in the background on ComfyUI's event loop.

Tokens come from the server environment (CIVITAI_TOKEN, HF_TOKEN, as set on Vast) and
fall back to the ones the browser sends from Settings. They are never sent back out.
"""

from __future__ import annotations

import asyncio
import hashlib
import os
import time
import uuid
from dataclasses import asdict, dataclass, field
from typing import Callable
from urllib.parse import urlencode

import aiohttp

from .links import (
    CIVITAI_API,
    filename_from_disposition,
    filename_from_url,
    guess_folder,
    hf_file_url,
    link_source,
    parse_civitai,
    parse_huggingface,
    primary_file,
    safe_filename,
    summarize_models,
)

CIVITAI_ENV = ("CIVITAI_TOKEN", "CIVITAI_API_KEY")
HF_ENV = ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN")
CHUNK = 1 << 20
USER_AGENT = "comfyui-marti"


def env_token(names: tuple[str, ...]) -> str | None:
    return next((os.environ[n].strip() for n in names if os.environ.get(n, "").strip()), None)


@dataclass
class Tokens:
    civitai: str | None = None
    hf: str | None = None

    @classmethod
    def resolve(cls, civitai_fallback: str | None, hf_fallback: str | None) -> "Tokens":
        return cls(env_token(CIVITAI_ENV) or civitai_fallback or None, env_token(HF_ENV) or hf_fallback or None)


class LinkError(Exception):
    """Something the user can fix: bad link, missing token, file exists."""


@dataclass
class Resolved:
    source: str
    url: str
    filename: str
    name: str
    folder: str | None = None
    size: int | None = None
    sha256: str | None = None
    page: str | None = None


@dataclass
class Job:
    id: str
    source: str
    url: str = field(repr=False)
    name: str
    folder: str
    filename: str
    sha256: str | None = field(default=None, repr=False)
    size: int | None = None
    done: int = 0
    speed: float = 0.0
    status: str = "queued"  # queued | downloading | verifying | done | error | cancelled
    error: str | None = None
    started: float = field(default_factory=time.time)

    def public(self) -> dict:
        data = asdict(self)
        del data["url"], data["sha256"]
        return data


def _session() -> aiohttp.ClientSession:
    return aiohttp.ClientSession(headers={"User-Agent": USER_AGENT}, timeout=aiohttp.ClientTimeout(total=None, sock_connect=30, sock_read=120))


def _civitai_url(url: str, token: str | None) -> str:
    # Query token instead of a header: the header breaks the signed storage redirect
    if not token:
        return url
    return f"{url}{'&' if '?' in url else '?'}{urlencode({'token': token})}"


async def _json(session: aiohttp.ClientSession, url: str, token: str | None) -> dict:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    async with session.get(url, headers=headers) as r:
        if r.status == 404:
            raise LinkError("Not found on Civitai")
        if r.status in (401, 403):
            raise LinkError("Civitai refused the request; check your Civitai token")
        if r.status == 429:
            raise LinkError("Civitai is rate limiting requests; try again in a minute")
        if r.status >= 400:
            raise LinkError(f"Civitai returned HTTP {r.status}")
        return await r.json()


async def resolve(ref: str, folders: list[str], tokens: Tokens) -> Resolved:
    ref = ref.strip()
    if not ref:
        raise LinkError("Paste a link first")
    async with _session() as session:
        source = link_source(ref)
        try:
            if source == "civitai":
                return await _resolve_civitai(session, ref, folders, tokens)
            if source == "hf":
                return await _resolve_hf(session, ref, folders, tokens)
            return await _resolve_url(session, ref, folders)
        except ValueError as e:
            raise LinkError(str(e)) from e
        except aiohttp.ClientError as e:
            raise LinkError(f"Network error: {e}") from e


async def _resolve_civitai(session, ref, folders, tokens) -> Resolved:
    model_id, version_id = parse_civitai(ref)
    if version_id is None:
        model = await _json(session, f"{CIVITAI_API}/models/{model_id}", tokens.civitai)
        version = next(iter(model.get("modelVersions") or []), None)
        if version is None:
            raise LinkError("This Civitai model has no versions")
        title, model_type = model.get("name", ""), model.get("type")
    else:
        version = await _json(session, f"{CIVITAI_API}/model-versions/{version_id}", tokens.civitai)
        title, model_type = (version.get("model") or {}).get("name", ""), (version.get("model") or {}).get("type")
        model_id = model_id or version.get("modelId")
    f = primary_file(version)
    if not f:
        raise LinkError("This Civitai version has no files")
    sha = (f.get("hashes") or {}).get("SHA256")
    return Resolved(
        source="civitai",
        url=f.get("downloadUrl") or f"https://civitai.com/api/download/models/{version['id']}",
        filename=f.get("name") or f"{version['id']}.safetensors",
        name=f"{title} · {version.get('name', '')}".strip(" ·"),
        folder=guess_folder(f.get("name") or "", folders, model_type),
        size=int((f.get("sizeKB") or 0) * 1024) or None,
        sha256=sha.lower() if sha else None,
        page=f"https://civitai.com/models/{model_id}?modelVersionId={version['id']}" if model_id else None,
    )


async def _resolve_hf(session, ref, folders, tokens) -> Resolved:
    repo, rev, path = parse_huggingface(ref)
    url = hf_file_url(repo, rev, path)
    headers = {"Authorization": f"Bearer {tokens.hf}"} if tokens.hf else {}
    async with session.head(url, headers=headers, allow_redirects=False) as r:
        if r.status in (401, 403):
            message = r.headers.get("X-Error-Message") or "Access denied"
            hint = "set HF_TOKEN or the Hugging Face token in Settings" if not tokens.hf else "accept the repo's terms on huggingface.co"
            raise LinkError(f"{message.split('. ')[0]}. Gated or private: {hint}.")
        if r.status == 404:
            raise LinkError("File not found on Hugging Face")
        if r.status >= 400:
            raise LinkError(f"Hugging Face returned HTTP {r.status}")
        size = r.headers.get("X-Linked-Size") or r.headers.get("Content-Length")
        etag = (r.headers.get("X-Linked-ETag") or "").strip('"')
    return Resolved(
        source="hf",
        url=url,
        filename=path.rsplit("/", 1)[-1],
        name=f"{repo}/{path}",
        folder=guess_folder(path, folders),
        size=int(size) if size and size.isdigit() else None,
        sha256=etag.lower() if len(etag) == 64 else None,  # LFS files: sha256 of the content
        page=f"https://huggingface.co/{repo}/blob/{rev}/{path}",
    )


async def _resolve_url(session, ref, folders) -> Resolved:
    filename, size = filename_from_url(ref), None
    try:
        async with session.head(ref, allow_redirects=True) as r:
            if r.status < 400:
                filename = filename_from_disposition(r.headers.get("Content-Disposition")) or filename_from_url(str(r.url)) or filename
                size = int(r.headers["Content-Length"]) if r.headers.get("Content-Length", "").isdigit() else None
    except aiohttp.ClientError:
        pass  # some servers reject HEAD; the download itself will tell
    if not filename:
        raise LinkError("Couldn't tell the file name from this link")
    return Resolved(source="url", url=ref, filename=filename, name=filename, folder=guess_folder(filename, folders), size=size)


class Downloads:
    """Background downloads, two at a time. `notify` gets each job's public dict on change."""

    def __init__(self, notify: Callable[[dict], None], parallel: int = 2):
        self.jobs: dict[str, Job] = {}
        self._tasks: dict[str, asyncio.Task] = {}
        self._notify = notify
        self._parallel = parallel
        self._slots: asyncio.Semaphore | None = None

    def list(self) -> list[dict]:
        return [j.public() for j in self.jobs.values()]

    def start(self, item: Resolved, folder: str, directory: str, filename: str, tokens: Tokens) -> Job:
        filename = safe_filename(filename)
        target = os.path.join(directory, filename)
        if os.path.exists(target):
            raise LinkError(f"models/{folder}/{filename} already exists")
        if any(j.folder == folder and j.filename == filename and j.status in ("queued", "downloading", "verifying") for j in self.jobs.values()):
            raise LinkError(f"models/{folder}/{filename} is already downloading")
        job = Job(id=uuid.uuid4().hex[:12], source=item.source, url=item.url, name=item.name,
                  folder=folder, filename=filename, sha256=item.sha256, size=item.size)
        self.jobs[job.id] = job
        self._slots = self._slots or asyncio.Semaphore(self._parallel)
        self._tasks[job.id] = asyncio.create_task(self._run(job, target, tokens))
        self._emit(job)
        return job

    def cancel(self, job_id: str) -> bool:
        task, job = self._tasks.get(job_id), self.jobs.get(job_id)
        if not task or not job or task.done():
            return False
        task.cancel()
        if job.status == "queued":
            # A task cancelled before it first runs never enters _run, so report it here
            job.status = "cancelled"
            self._emit(job)
        return True

    def clear_finished(self) -> None:
        for job_id in [j.id for j in self.jobs.values() if j.status in ("done", "error", "cancelled")]:
            self.jobs.pop(job_id, None)
            self._tasks.pop(job_id, None)

    def _emit(self, job: Job) -> None:
        try:
            self._notify(job.public())
        except Exception:  # noqa: BLE001 - progress is best effort
            pass

    async def _run(self, job: Job, target: str, tokens: Tokens) -> None:
        part = target + ".part"
        try:
            async with self._slots:
                job.status = "downloading"
                job.started = time.time()
                self._emit(job)
                sha = await self._fetch(job, part, tokens)
                if job.sha256:
                    job.status = "verifying"
                    self._emit(job)
                    if sha != job.sha256:
                        raise LinkError("Checksum mismatch, the download is corrupt")
                if os.path.exists(target):
                    raise LinkError(f"models/{job.folder}/{job.filename} appeared while downloading")
                os.replace(part, target)
                job.status = "done"
        except asyncio.CancelledError:
            job.status = "cancelled"
        except LinkError as e:
            job.status, job.error = "error", str(e)
        except (aiohttp.ClientError, asyncio.TimeoutError, OSError) as e:
            job.status, job.error = "error", f"{type(e).__name__}: {e}"
        finally:
            if job.status != "done":
                _remove(part)
            self._emit(job)

    async def _fetch(self, job: Job, part: str, tokens: Tokens) -> str:
        url, headers = job.url, {}
        if job.source == "civitai":
            url = _civitai_url(url, tokens.civitai)
        elif job.source == "hf" and tokens.hf:
            headers["Authorization"] = f"Bearer {tokens.hf}"
        digest = hashlib.sha256()
        async with _session() as session, session.get(url, headers=headers) as r:
            if r.status in (401, 403):
                who = {"civitai": "Civitai", "hf": "Hugging Face"}.get(job.source, "The server")
                raise LinkError(f"{who} refused the download (HTTP {r.status}); it probably needs a token")
            if r.status >= 400:
                raise LinkError(f"Download failed: HTTP {r.status}")
            if r.content_type == "text/html":
                raise LinkError("Got a web page instead of a file; the link may need a login or token")
            expected = r.content_length
            job.size = expected or job.size
            last_emit, window_start, window_bytes = 0.0, time.monotonic(), 0
            with open(part, "wb") as f:
                async for chunk in r.content.iter_chunked(CHUNK):
                    await asyncio.to_thread(_write, f, digest, chunk)
                    job.done += len(chunk)
                    window_bytes += len(chunk)
                    now = time.monotonic()
                    if now - window_start >= 1:
                        job.speed = window_bytes / (now - window_start)
                        window_start, window_bytes = now, 0
                    if now - last_emit >= 0.5:
                        last_emit = now
                        self._emit(job)
        if expected and job.done != expected:
            raise LinkError(f"Download ended early ({job.done} of {expected} bytes)")
        return digest.hexdigest()


def _write(f, digest, chunk: bytes) -> None:
    f.write(chunk)
    digest.update(chunk)


def _remove(path: str) -> None:
    try:
        os.remove(path)
    except OSError:
        pass


class CivitaiSearch:
    """Civitai model search with a short cache, so paging back and forth costs nothing."""

    def __init__(self, ttl: float = 600, max_entries: int = 64):
        self._cache: dict[str, tuple[float, dict]] = {}
        self._ttl = ttl
        self._max = max_entries

    async def search(self, query: str, model_type: str, sort: str, cursor: str, token: str | None) -> dict:
        params = {"limit": "20", "nsfw": "true"}
        if query.strip():
            params["query"] = query.strip()
        if model_type:
            params["types"] = model_type
        if sort:
            params["sort"] = sort
        if cursor:
            params["cursor"] = cursor
        key = urlencode(sorted(params.items()))
        hit = self._cache.get(key)
        if hit and time.time() - hit[0] < self._ttl:
            return hit[1]
        async with _session() as session:
            try:
                payload = await _json(session, f"{CIVITAI_API}/models?{urlencode(params)}", token)
            except aiohttp.ClientError as e:
                raise LinkError(f"Network error: {e}") from e
        result = summarize_models(payload)
        if len(self._cache) >= self._max:
            self._cache.pop(next(iter(self._cache)))
        self._cache[key] = (time.time(), result)
        return result
