from typing_extensions import override

from comfy_api.latest import ComfyExtension, io

from .marti.lora_deck.node import LoraDeck

WEB_DIRECTORY = "./web"


class MartiExtension(ComfyExtension):
    @override
    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        return [LoraDeck]


async def comfy_entrypoint() -> MartiExtension:
    return MartiExtension()
