import type { MartiNode } from "../../shared/node";
import { domWidget } from "../../shared/widget";
import styles from "./styles.css";
import { SwitchView } from "./switchView";

const WIDGET_TYPE = "MARTI_SOURCE_SWITCH"; // must match marti/source_switch/node.py

export const sourceSwitch: MartiNode = {
  styles,
  widgets: { [WIDGET_TYPE]: domWidget(WIDGET_TYPE, (events, node) => new SwitchView(events, node), 300) },
};
