import type { MartiNode } from "../../shared/node";
import { domWidget } from "../../shared/widget";
import { DeckView } from "./deckView";
import styles from "./styles.css";

const WIDGET_TYPE = "LORA_DECK"; // must match marti/lora_deck/node.py

export const loraDeck: MartiNode = {
  styles,
  widgets: { [WIDGET_TYPE]: domWidget(WIDGET_TYPE, (events) => new DeckView(events), 340) },
};
