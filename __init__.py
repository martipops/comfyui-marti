from typing_extensions import override

from comfy_api.latest import ComfyExtension, io

from .lora_deck.nodes import LoraDeck

WEB_DIRECTORY = "./web"


class LoraDeckExtension(ComfyExtension):
    @override
    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        return [LoraDeck]


async def comfy_entrypoint() -> LoraDeckExtension:
    return LoraDeckExtension()
