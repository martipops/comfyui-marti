import type { MartiNode } from "../../shared/node";
import { domWidget } from "../../shared/widget";
import { PromptView } from "./promptView";
import styles from "./styles.css";

const WIDGET_TYPE = "MARTI_PROMPT"; // must match marti/prompt/node.py

export const martiPrompt: MartiNode = {
  styles,
  widgets: { [WIDGET_TYPE]: domWidget(WIDGET_TYPE, (events) => new PromptView(events), 280) },
};
