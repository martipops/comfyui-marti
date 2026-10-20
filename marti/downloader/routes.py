"""HTTP API for the Models sidebar tab. Imported once from the pack's __init__."""

from __future__ import annotations

import folder_paths
from aiohttp import web
from server import PromptServer

from .service import CIVITAI_ENV, HF_ENV, CivitaiSearch, Downloads, LinkError, Tokens, env_token, resolve

EVENT = "marti.download"
# folder_names_and_paths entries that aren't model folders
_NOT_MODELS = {"custom_nodes", "configs"}

server = PromptServer.instance
downloads = Downloads(lambda job: server.send_sync(EVENT, job))
search = CivitaiSearch()


def _folders() -> list[str]:
    return sorted(k for k in folder_paths.folder_names_and_paths if k not in _NOT_MODELS)


def _tokens(request: web.Request) -> Tokens:
    return Tokens.resolve(request.headers.get("X-Marti-Civitai-Token"), request.headers.get("X-Marti-HF-Token"))


def _error(message: str, status: int = 400) -> web.Response:
    return web.json_response({"error": message}, status=status)


async def _body(request: web.Request) -> dict:
    try:
        data = await request.json()
    except ValueError:
        data = None
    return data if isinstance(data, dict) else {}


@server.routes.get("/marti/models/status")
async def status(request: web.Request) -> web.Response:
    return web.json_response({
        "folders": _folders(),
        # Only whether the server has them; the values never leave the server
        "env": {"civitai": env_token(CIVITAI_ENV) is not None, "hf": env_token(HF_ENV) is not None},
        "jobs": downloads.list(),
    })


@server.routes.post("/marti/models/resolve")
async def resolve_link(request: web.Request) -> web.Response:
    body = await _body(request)
    try:
        item = await resolve(str(body.get("url") or ""), _folders(), _tokens(request))
    except LinkError as e:
        return _error(str(e))
    data = {k: v for k, v in item.__dict__.items() if k != "url"}
    data["exists"] = [f for f in _folders() if folder_paths.get_full_path(f, item.filename)]
    return web.json_response(data)


@server.routes.post("/marti/models/download")
async def start_download(request: web.Request) -> web.Response:
    body = await _body(request)
    folder = str(body.get("folder") or "")
    if folder not in _folders():
        return _error(f"Unknown models folder: {folder!r}")
    tokens = _tokens(request)
    try:
        # Re-resolve on the server instead of trusting a URL from the browser
        item = await resolve(str(body.get("url") or ""), _folders(), tokens)
        job = downloads.start(item, folder, folder_paths.get_folder_paths(folder)[0],
                              str(body.get("filename") or item.filename), tokens)
    except (LinkError, ValueError) as e:
        return _error(str(e))
    return web.json_response(job.public())


@server.routes.post("/marti/models/cancel")
async def cancel_download(request: web.Request) -> web.Response:
    body = await _body(request)
    return web.json_response({"cancelled": downloads.cancel(str(body.get("id") or ""))})


@server.routes.post("/marti/models/clear")
async def clear_downloads(request: web.Request) -> web.Response:
    downloads.clear_finished()
    return web.json_response({"jobs": downloads.list()})


@server.routes.get("/marti/civitai/search")
async def civitai_search(request: web.Request) -> web.Response:
    q = request.query
    try:
        result = await search.search(q.get("query", ""), q.get("type", ""), q.get("sort", ""), q.get("cursor", ""),
                                     _tokens(request).civitai)
    except LinkError as e:
        return _error(str(e), 502)
    return web.json_response(result)
