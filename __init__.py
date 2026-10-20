from typing_extensions import override

from comfy_api.latest import ComfyExtension, io

from .marti.downloader import routes as _downloader_routes  # noqa: F401 - registers /marti/models/* routes
from .marti.lora_deck.node import LoraDeck
from .marti.source_switch.node import SourceSwitch

WEB_DIRECTORY = "./web"


class MartiExtension(ComfyExtension):
    @override
    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        return [LoraDeck, SourceSwitch]


async def comfy_entrypoint() -> MartiExtension:
    return MartiExtension()
