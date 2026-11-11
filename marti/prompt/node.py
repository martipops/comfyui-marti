from __future__ import annotations

from comfy_api.latest import io

WIDGET_TYPE = "MARTI_PROMPT"
PromptInput = io.Custom(WIDGET_TYPE)


class MartiPrompt(io.ComfyNode):
    """A String primitive with a prompt box made for phones (big text, grows as you type, full-screen editor)."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="MartiPrompt",
            display_name="Marti Prompt",
            category="utils/primitive",
            search_aliases=["prompt", "positive prompt", "text", "string", "mobile prompt"],
            description="A text box that is easy to edit on a phone. Outputs the text as a STRING.",
            inputs=[PromptInput.Input("prompt", extra_dict={"socketless": True})],
            outputs=[io.String.Output(display_name="STRING")],
        )

    @classmethod
    def execute(cls, prompt) -> io.NodeOutput:
        return io.NodeOutput(prompt)
