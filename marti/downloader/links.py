"""Model link parsing and Civitai response shaping. Pure logic, no ComfyUI or network imports."""

from __future__ import annotations

import re
from urllib.parse import parse_qs, unquote, urlparse

CIVITAI_API = "https://civitai.com/api/v1"

# Civitai model type -> ComfyUI models/ folder
CIVITAI_FOLDERS = {
    "Checkpoint": "checkpoints",
    "LORA": "loras",
    "LoCon": "loras",
    "DoRA": "loras",
    "TextualInversion": "embeddings",
    "VAE": "vae",
    "Controlnet": "controlnet",
    "Upscaler": "upscale_models",
    "Hypernetwork": "hypernetworks",
}

# Words in a file path that hint at its folder, checked in order
_PATH_HINTS = [
    ("text_encoder", "text_encoders"),
    ("clip_vision", "clip_vision"),
    ("controlnet", "controlnet"),
    ("diffusion_model", "diffusion_models"),
    ("unet", "diffusion_models"),
    ("lora", "loras"),
    ("vae", "vae"),
    ("upscale", "upscale_models"),
    ("esrgan", "upscale_models"),
    ("embedding", "embeddings"),
    ("checkpoint", "checkpoints"),
]


def link_source(ref: str) -> str:
    """'civitai', 'hf' or 'url'."""
    ref = ref.strip()
    if ref.isdigit() or "civitai" in ref:
        return "civitai"
    host = urlparse(ref).hostname or ""
    if host in ("huggingface.co", "hf.co") or not ref.startswith(("http://", "https://")):
        return "hf"
    return "url"


def parse_civitai(ref: str) -> tuple[int | None, int | None]:
    """(model_id, version_id) from an ID, AIR, or civitai.com/.red URL."""
    ref = ref.strip()
    if ref.isdigit():
        return int(ref), None
    if m := re.search(r"civitai:(\d+)(?:@(\d+))?", ref):
        return int(m.group(1)), int(m.group(2)) if m.group(2) else None
    url = urlparse(ref)
    if m := re.search(r"/api/download/models/(\d+)", url.path):
        return None, int(m.group(1))
    version = parse_qs(url.query).get("modelVersionId", [None])[0]
    if m := re.search(r"/models/(\d+)", url.path):
        return int(m.group(1)), int(version) if version and version.isdigit() else None
    raise ValueError(f"Not a Civitai model link: {ref}")


def parse_huggingface(ref: str) -> tuple[str, str, str]:
    """(repo, revision, path) from a huggingface.co file URL or org/repo/path."""
    ref = ref.strip()
    if ref.startswith(("http://", "https://")):
        parts = unquote(urlparse(ref).path).strip("/").split("/")
        if len(parts) >= 5 and parts[2] in ("resolve", "blob"):
            return f"{parts[0]}/{parts[1]}", parts[3], "/".join(parts[4:])
        raise ValueError("Hugging Face links must point to a file (…/blob/main/model.safetensors)")
    parts = ref.strip("/").split("/")
    if len(parts) < 3:
        raise ValueError(f"Expected a link or org/repo/path/to/file, got {ref!r}")
    return f"{parts[0]}/{parts[1]}", "main", "/".join(parts[2:])


def hf_file_url(repo: str, rev: str, path: str) -> str:
    return f"https://huggingface.co/{repo}/resolve/{rev}/{path}"


def filename_from_url(url: str) -> str:
    return unquote(urlparse(url).path).rstrip("/").rsplit("/", 1)[-1]


def filename_from_disposition(header: str | None) -> str | None:
    if not header:
        return None
    if m := re.search(r"filename\*\s*=\s*[^']*'[^']*'([^;]+)", header):
        return unquote(m.group(1).strip().strip('"'))
    if m := re.search(r'filename\s*=\s*"?([^";]+)"?', header):
        return m.group(1).strip()
    return None


def safe_filename(name: str) -> str:
    """A bare file name that can't escape its folder."""
    name = re.sub(r"[\x00-\x1f]", "", name.replace("\\", "/").rsplit("/", 1)[-1]).strip()
    if name in ("", ".", "..") or name.startswith("."):
        raise ValueError(f"Bad file name: {name!r}")
    return name


def guess_folder(path: str, folders: list[str], civitai_type: str | None = None) -> str | None:
    """Best models/ folder for a file, limited to folders that exist."""
    if civitai_type and CIVITAI_FOLDERS.get(civitai_type) in folders:
        return CIVITAI_FOLDERS[civitai_type]
    lowered = path.lower()
    for part in lowered.split("/")[:-1]:
        if part in folders:
            return part
    for hint, folder in _PATH_HINTS:
        if hint in lowered and folder in folders:
            return folder
    if re.search(r"(^|/)\d+x[-_]", lowered) and "upscale_models" in folders:
        return "upscale_models"
    return None


def primary_file(version: dict) -> dict | None:
    files = [f for f in version.get("files") or [] if f.get("type") in (None, "Model", "Pruned Model")]
    files = files or version.get("files") or []
    return next((f for f in files if f.get("primary")), files[0] if files else None)


def _thumb(version: dict) -> dict | None:
    image = next((i for i in version.get("images") or [] if i.get("type") == "image" and i.get("url")), None)
    return {"url": image["url"], "nsfwLevel": image.get("nsfwLevel") or 0} if image else None


def summarize_models(payload: dict, max_versions: int = 12) -> dict:
    """Trim a Civitai /models search response to what the panel shows."""
    items = []
    for m in payload.get("items") or []:
        versions = []
        for v in (m.get("modelVersions") or [])[:max_versions]:
            f = primary_file(v)
            if not f:
                continue
            versions.append({
                "id": v.get("id"),
                "name": v.get("name") or "",
                "baseModel": v.get("baseModel") or "",
                "file": f.get("name") or "",
                "size": int((f.get("sizeKB") or 0) * 1024),
            })
        if not versions:
            continue
        thumb = next((t for t in (_thumb(v) for v in m.get("modelVersions") or []) if t), None)
        items.append({
            "id": m.get("id"),
            "name": m.get("name") or "",
            "type": m.get("type") or "",
            "creator": (m.get("creator") or {}).get("username") or "",
            "downloads": (m.get("stats") or {}).get("downloadCount") or 0,
            "likes": (m.get("stats") or {}).get("thumbsUpCount") or 0,
            "thumb": thumb,
            "versions": versions,
        })
    return {"items": items, "nextCursor": (payload.get("metadata") or {}).get("nextCursor")}
