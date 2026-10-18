import { dropOptionalInputs, keepOutputs, type MartiNode } from "../../shared/node";
import { domWidget } from "../../shared/widget";
import { defaultConfig, INPUT_NAME } from "./model";
import styles from "./styles.css";
import { PANEL_HEIGHT, SwitchView } from "./switchView";

const WIDGET_TYPE = "MARTI_SOURCE_SWITCH"; // must match marti/source_switch/node.py
const WIDGET_MARGIN = 4; // domWidget() margin, top and bottom

export const sourceSwitch: MartiNode = {
  styles,
  widgets: { [WIDGET_TYPE]: domWidget(WIDGET_TYPE, (events, node) => new SwitchView(events, node), 300) },
  nodeId: "MartiSourceSwitch",
  // The backend declares every possible socket (so they can be lazy); nodes and the
  // library preview start with just the default config and the view adds the rest.
  patchDef(def) {
    dropOptionalInputs(def, (name) => INPUT_NAME.test(name));
    keepOutputs(def, defaultConfig().outputs);
  },
  // Panel at the top, sockets below it.
  patchType(nodeType) {
    nodeType.slot_start_y = PANEL_HEIGHT + WIDGET_MARGIN * 2;
    Object.assign(nodeType.prototype, { widgets_start_y: 0 });
  },
};
