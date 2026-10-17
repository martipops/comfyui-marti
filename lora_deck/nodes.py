from __future__ import annotations

import comfy.sd
import comfy.utils
import folder_paths
from comfy_api.latest import io

from .cache import LoraFileCache
from .deck import active_rows, parse_deck

WIDGET_TYPE = "LORA_DECK"
LoraDeckInput = io.Custom(WIDGET_TYPE)

_cache = LoraFileCache(
    loader=lambda path: comfy.utils.load_torch_file(path, safe_load=True, return_metadata=True),
    max_bytes=2 * 1024**3,
)


class LoraDeck(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LoraDeck",
            display_name="LoRA Deck",
            category="loaders",
            search_aliases=["lora", "lora stack", "power lora", "multi lora", "lora loader"],
            description="Apply any number of LoRAs, each with its own toggle and strength.",
            inputs=[
                io.Model.Input("model"),
                io.Clip.Input("clip", optional=True,
                              tooltip="Optional. Only needed for LoRAs that also train the text encoder."),
                LoraDeckInput.Input("loras"),
            ],
            outputs=[
                io.Model.Output(display_name="MODEL"),
                io.Clip.Output(display_name="CLIP"),
            ],
        )

    @classmethod
    def validate_inputs(cls, loras, **kwargs) -> bool | str:
        available = set(folder_paths.get_filename_list("loras"))
        missing = [row.lora for row in parse_deck(loras) if row.on and row.lora and row.lora not in available]
        if missing:
            return "LoRA file not found: " + ", ".join(missing)
        return True

    @classmethod
    def execute(cls, model, loras, clip=None) -> io.NodeOutput:
        has_clip = clip is not None
        for row in active_rows(loras, has_clip):
            path = folder_paths.get_full_path_or_raise("loras", row.lora)
            lora, metadata = _cache.get(path)
            strength_model, strength_clip = row.strengths(has_clip)
            model, clip = comfy.sd.load_lora_for_models(
                model, clip, lora, strength_model, strength_clip, lora_metadata=metadata
            )
        return io.NodeOutput(model, clip)
