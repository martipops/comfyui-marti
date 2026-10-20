import asyncio
import hashlib
import os
import tempfile
import unittest

from aiohttp import web

from marti.downloader.links import (
    filename_from_disposition,
    guess_folder,
    link_source,
    parse_civitai,
    parse_huggingface,
    safe_filename,
    summarize_models,
)
from marti.downloader.service import Downloads, LinkError, Resolved, Tokens

FOLDERS = ["checkpoints", "diffusion_models", "loras", "text_encoders", "upscale_models", "vae"]


class LinkTests(unittest.TestCase):
    def test_link_source(self):
        self.assertEqual(link_source("https://civitai.red/models/1?modelVersionId=2"), "civitai")
        self.assertEqual(link_source("133005"), "civitai")
        self.assertEqual(link_source("https://huggingface.co/a/b/blob/main/x.safetensors"), "hf")
        self.assertEqual(link_source("a/b/x.safetensors"), "hf")
        self.assertEqual(link_source("https://example.com/x.pth"), "url")
        self.assertEqual(link_source("https://example.com/huggingface.co.pth"), "url")

    def test_parse_civitai(self):
        self.assertEqual(parse_civitai("https://civitai.red/models/827184/wai?modelVersionId=2883731"), (827184, 2883731))
        self.assertEqual(parse_civitai("https://civitai.com/models/4201"), (4201, None))
        self.assertEqual(parse_civitai("https://civitai.com/api/download/models/130072"), (None, 130072))
        self.assertEqual(parse_civitai("urn:air:sdxl:lora:civitai:4201@130072"), (4201, 130072))
        with self.assertRaises(ValueError):
            parse_civitai("https://civitai.com/user/someone")

    def test_parse_huggingface(self):
        self.assertEqual(parse_huggingface("https://huggingface.co/Comfy-Org/Krea-2/blob/main/vae/q.safetensors"),
                         ("Comfy-Org/Krea-2", "main", "vae/q.safetensors"))
        with self.assertRaises(ValueError):
            parse_huggingface("https://huggingface.co/Comfy-Org/Krea-2")

    def test_guess_folder(self):
        self.assertEqual(guess_folder("x.safetensors", FOLDERS, "LORA"), "loras")
        self.assertEqual(guess_folder("text_encoders/qwen.safetensors", FOLDERS), "text_encoders")
        self.assertEqual(guess_folder("checkpoints/sam3.1.safetensors", FOLDERS), "checkpoints")
        self.assertEqual(guess_folder("4x-UltraSharp.pth", FOLDERS), "upscale_models")
        self.assertEqual(guess_folder("model.safetensors", FOLDERS), None)
        # mapped folder that doesn't exist falls through to path hints
        self.assertEqual(guess_folder("x.pt", FOLDERS, "TextualInversion"), None)

    def test_safe_filename(self):
        self.assertEqual(safe_filename("../../etc/passwd"), "passwd")
        self.assertEqual(safe_filename("a\\b\\c.safetensors"), "c.safetensors")
        for bad in ("", "..", ".hidden", "dir/"):
            with self.assertRaises(ValueError):
                safe_filename(bad)

    def test_disposition(self):
        self.assertEqual(filename_from_disposition('attachment; filename="a b.safetensors"'), "a b.safetensors")
        self.assertEqual(filename_from_disposition("attachment; filename*=UTF-8''%E2%9C%93.pth"), "✓.pth")
        self.assertIsNone(filename_from_disposition(None))

    def test_summarize_models(self):
        payload = {
            "items": [
                {"id": 1, "name": "M", "type": "LORA", "creator": {"username": "u"},
                 "stats": {"downloadCount": 5},
                 "modelVersions": [
                     {"id": 11, "name": "v2", "baseModel": "Illustrious",
                      "files": [{"name": "cfg.yaml", "type": "Config"},
                                {"name": "m.safetensors", "type": "Model", "primary": True, "sizeKB": 2}],
                      "images": [{"type": "video", "url": "v"}, {"type": "image", "url": "i", "nsfwLevel": 8}]},
                     {"id": 12, "name": "empty", "files": []},
                 ]},
                {"id": 2, "name": "no files", "modelVersions": [{"id": 21, "files": []}]},
            ],
            "metadata": {"nextCursor": "abc"},
        }
        result = summarize_models(payload)
        self.assertEqual(result["nextCursor"], "abc")
        self.assertEqual(len(result["items"]), 1)
        item = result["items"][0]
        self.assertEqual(item["thumb"], {"url": "i", "nsfwLevel": 8})
        self.assertEqual(item["versions"], [{"id": 11, "name": "v2", "baseModel": "Illustrious",
                                             "file": "m.safetensors", "size": 2048}])


class DownloadTests(unittest.IsolatedAsyncioTestCase):
    BODY = os.urandom(3 * 1024 * 1024 + 123)

    async def asyncSetUp(self):
        app = web.Application()
        app.router.add_get("/model.bin", lambda r: web.Response(body=self.BODY, content_type="application/octet-stream"))
        app.router.add_get("/login", lambda r: web.Response(text="<html>log in</html>", content_type="text/html"))
        app.router.add_get("/secret", lambda r: web.Response(status=401))
        self.runner = web.AppRunner(app)
        await self.runner.setup()
        site = web.TCPSite(self.runner, "127.0.0.1", 0)
        await site.start()
        self.base = f"http://127.0.0.1:{site._server.sockets[0].getsockname()[1]}"
        self.tmp = tempfile.TemporaryDirectory()
        self.events = []
        self.downloads = Downloads(self.events.append)

    async def asyncTearDown(self):
        await self.runner.cleanup()
        self.tmp.cleanup()

    def item(self, path, sha256=None):
        return Resolved(source="url", url=self.base + path, filename="model.bin", name="model", sha256=sha256)

    async def run_job(self, path, sha256=None, filename="model.bin"):
        job = self.downloads.start(self.item(path, sha256), "loras", self.tmp.name, filename, Tokens())
        await self.downloads._tasks[job.id]
        return job

    def files(self):
        return sorted(os.listdir(self.tmp.name))

    async def test_download_verifies_and_moves_into_place(self):
        job = await self.run_job("/model.bin", hashlib.sha256(self.BODY).hexdigest())
        self.assertEqual((job.status, job.error), ("done", None))
        self.assertEqual(self.files(), ["model.bin"])
        with open(os.path.join(self.tmp.name, "model.bin"), "rb") as f:
            self.assertEqual(f.read(), self.BODY)
        self.assertEqual(self.events[-1]["status"], "done")
        self.assertNotIn("url", self.events[-1])

    async def test_checksum_mismatch_leaves_nothing(self):
        job = await self.run_job("/model.bin", "0" * 64)
        self.assertEqual(job.status, "error")
        self.assertIn("Checksum", job.error)
        self.assertEqual(self.files(), [])

    async def test_refuses_existing_file_and_html_and_auth(self):
        await self.run_job("/model.bin")
        with self.assertRaises(LinkError):
            self.downloads.start(self.item("/model.bin"), "loras", self.tmp.name, "model.bin", Tokens())
        html = await self.run_job("/login", filename="other.bin")
        self.assertIn("web page", html.error)
        denied = await self.run_job("/secret", filename="secret.bin")
        self.assertIn("token", denied.error)
        self.assertEqual(self.files(), ["model.bin"])

    async def test_cancel(self):
        job = self.downloads.start(self.item("/model.bin"), "loras", self.tmp.name, "model.bin", Tokens())
        self.assertTrue(self.downloads.cancel(job.id))
        await asyncio.gather(self.downloads._tasks[job.id], return_exceptions=True)
        self.assertEqual(job.status, "cancelled")
        self.assertEqual(self.files(), [])
        self.downloads.clear_finished()
        self.assertEqual(self.downloads.list(), [])


if __name__ == "__main__":
    unittest.main()
