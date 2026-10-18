from __future__ import annotations

from comfy_api.latest import io

from .switch import MAX_CHANNELS, MAX_OUTPUTS, input_name, parse_config

WIDGET_TYPE = "MARTI_SOURCE_SWITCH"
SourceSwitchConfig = io.Custom(WIDGET_TYPE)


class SourceSwitch(io.ComfyNode):
    """Routes one of several channels to its outputs. Inactive channels are never executed."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        # Every socket is declared up front so ComfyUI knows they are lazy;
        # the frontend hides the ones the config doesn't use.
        slots = [
            io.AnyType.Input(input_name(c, o), optional=True, lazy=True)
            for c in range(MAX_CHANNELS)
            for o in range(MAX_OUTPUTS)
        ]
        return io.Schema(
            node_id="MartiSourceSwitch",
            display_name="Source Switch",
            category="utils",
            search_aliases=["switch", "model switch", "checkpoint switch", "subgraph switch", "router", "select"],
            description="Pick one of several channels (checkpoints, subgraphs, anything). Only the active channel runs.",
            inputs=[
                SourceSwitchConfig.Input("config"),
                io.Int.Input("channel", optional=True, force_input=True,
                             tooltip="Overrides the dropdown when connected. Wraps around, so any integer works."),
                *slots,
            ],
            outputs=[io.AnyType.Output(f"out{o}", display_name=f"out{o}") for o in range(MAX_OUTPUTS)],
        )

    @classmethod
    def validate_inputs(cls, config, **kwargs) -> bool | str:
        cfg = parse_config(config)
        if not cfg.channels:
            return "Source Switch has no channels"
        if not cfg.has_active:
            return f"Source Switch: active channel C{cfg.active} does not exist"
        return True

    @classmethod
    def check_lazy_status(cls, config, channel=None, **kwargs) -> list[str]:
        # Connected but not yet evaluated inputs arrive as None; unconnected ones are absent.
        inputs = parse_config(config).select(channel).active_inputs()
        return [name for _, name in inputs if name in kwargs and kwargs[name] is None]

    @classmethod
    def execute(cls, config, channel=None, **kwargs) -> io.NodeOutput:
        outputs = [None] * MAX_OUTPUTS
        for index, name in parse_config(config).select(channel).active_inputs():
            outputs[index] = kwargs.get(name)
        return io.NodeOutput(*outputs)
