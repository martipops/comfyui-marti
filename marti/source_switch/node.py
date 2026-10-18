from __future__ import annotations

from comfy_api.latest import io

from .switch import MAX_CHANNELS, MAX_SOURCES, input_name, parse_config

WIDGET_TYPE = "MARTI_SOURCE_SWITCH"
SourceSwitchConfig = io.Custom(WIDGET_TYPE)


class SourceSwitch(io.ComfyNode):
    """Routes one of several sources to its outputs. Inactive sources are never executed."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        slots = [
            io.AnyType.Input(input_name(s, c), optional=True, lazy=True)
            for s in range(MAX_SOURCES)
            for c in range(MAX_CHANNELS)
        ]
        return io.Schema(
            node_id="MartiSourceSwitch",
            display_name="Source Switch",
            category="utils",
            search_aliases=["switch", "model switch", "checkpoint switch", "subgraph switch", "router", "select"],
            description="Pick one of several sources (checkpoints, subgraphs, anything). Only the active source runs.",
            inputs=[SourceSwitchConfig.Input("config"), *slots],
            outputs=[io.AnyType.Output(f"out{c}", display_name=f"out {c + 1}") for c in range(MAX_CHANNELS)],
        )

    @classmethod
    def validate_inputs(cls, config, **kwargs) -> bool | str:
        cfg = parse_config(config)
        if not cfg.sources:
            return "Source Switch has no sources"
        if cfg.active_source is None:
            return "Source Switch has no active source selected"
        return True

    @classmethod
    def check_lazy_status(cls, config, **kwargs) -> list[str]:
        # Connected but not yet evaluated inputs arrive as None; unconnected ones are absent.
        return [name for _, name in parse_config(config).active_inputs() if name in kwargs and kwargs[name] is None]

    @classmethod
    def execute(cls, config, **kwargs) -> io.NodeOutput:
        outputs = [None] * MAX_CHANNELS
        for index, name in parse_config(config).active_inputs():
            outputs[index] = kwargs.get(name)
        return io.NodeOutput(*outputs)
