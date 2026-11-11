from __future__ import annotations

from comfy_api.latest import io

WIDGET_TYPE = "MARTI_PROMPT"
PromptInput = io.Custom(WIDGET_TYPE)


class MartiPrompt(io.ComfyNode):
    """CLIP Text Encode with a prompt box made for phones (big text, grows as you type, full-screen editor)."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="MartiPrompt",
            display_name="Marti Prompt",
            category="conditioning",
            search_aliases=["prompt", "positive prompt", "text encode", "mobile prompt", "clip text encode"],
            description="Encodes a prompt like CLIP Text Encode, with a large text box that is easy to edit on a phone.",
            inputs=[
                io.Clip.Input("clip"),
                PromptInput.Input("prompt", extra_dict={"socketless": True}),
            ],
            outputs=[
                io.Conditioning.Output(display_name="CONDITIONING"),
                io.String.Output(display_name="STRING"),
            ],
        )

    @classmethod
    def execute(cls, clip, prompt) -> io.NodeOutput:
        tokens = clip.tokenize(prompt)
        return io.NodeOutput(clip.encode_from_tokens_scheduled(tokens), prompt)
