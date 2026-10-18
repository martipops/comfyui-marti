// Keeps the node's sockets in line with the config. Only public node APIs are used
// (addInput/removeInput/addOutput/removeOutput/connect), so the frontend's own
// link bookkeeping stays correct.
import type { ComfyNode } from "../../shared/comfy";
import { channelLabel, desiredInputs, INPUT_NAME, type SwitchConfig } from "./model";

const ANY = "*";

const isManaged = (name: string) => INPUT_NAME.test(name);
const outputOf = (name: string) => Number(INPUT_NAME.exec(name)![2]);

/** Detected type per output: the type of any connected input feeding that output. */
export function outputTypes(node: ComfyNode, cfg: SwitchConfig): string[] {
  const types: string[] = Array.from({ length: cfg.outputs }, () => ANY);
  // getInputLink throws while the node is being created and isn't in a graph yet.
  if (!node.graph) return types;
  node.inputs.forEach((input, i) => {
    if (!isManaged(input.name)) return;
    const link = node.getInputLink(i);
    const o = outputOf(input.name);
    if (link && o < types.length && types[o] === ANY && link.type && link.type !== ANY) types[o] = link.type;
  });
  return types;
}

type Origins = Map<string, { originId: number | string; originSlot: number }>;

/** Removes every managed input (last first) and returns what was connected to each. */
function detachAll(node: ComfyNode): Origins {
  const origins: Origins = new Map();
  for (let i = node.inputs.length - 1; i >= 0; i--) {
    const { name } = node.inputs[i];
    if (!isManaged(name)) continue;
    const link = node.getInputLink(i);
    if (link) origins.set(name, { originId: link.origin_id, originSlot: link.origin_slot });
    node.removeInput(i);
  }
  return origins;
}

function reconnect(node: ComfyNode, origins: Origins) {
  for (const [name, { originId, originSlot }] of origins) {
    const origin = node.graph?.getNodeById(originId);
    const slot = node.inputs.findIndex((i) => i.name === name);
    if (origin && slot >= 0) origin.connect(originSlot, node, slot);
  }
}

export function syncSockets(node: ComfyNode, cfg: SwitchConfig) {
  const desired = desiredInputs(cfg);
  const wanted = new Set(desired);

  for (let i = node.inputs.length - 1; i >= 0; i--) {
    const { name } = node.inputs[i];
    if (isManaged(name) && !wanted.has(name)) node.removeInput(i);
  }

  // Appending keeps the order only if what exists is a prefix of the desired order
  // (true when adding a channel); adding an output inserts sockets mid-list, so rebuild.
  const current = node.inputs.filter((i) => isManaged(i.name)).map((i) => i.name);
  if (current.every((name, i) => desired[i] === name)) {
    for (const name of desired.slice(current.length)) node.addInput(name, ANY);
  } else {
    const origins = detachAll(node);
    for (const name of desired) node.addInput(name, ANY);
    reconnect(node, origins);
  }

  while (node.outputs.length > cfg.outputs) node.removeOutput(node.outputs.length - 1);
  while (node.outputs.length < cfg.outputs) node.addOutput(`out${node.outputs.length}`, ANY);

  relabel(node, cfg);
}

/** Labels and types only; cheap enough to run on every connection change. */
export function relabel(node: ComfyNode, cfg: SwitchConfig) {
  const types = outputTypes(node, cfg);
  const outputName = (o: number) => (types[o] !== ANY ? types[o] : `out${o}`);

  for (const input of node.inputs) {
    const m = INPUT_NAME.exec(input.name);
    if (!m) continue;
    const o = Number(m[2]);
    input.label = `${channelLabel(Number(m[1]))} · ${outputName(o)}`;
    input.type = types[o] ?? ANY;
  }
  node.outputs.forEach((output, o) => {
    output.label = outputName(o);
    output.type = types[o] ?? ANY;
  });
  node.setDirtyCanvas(true, true);
}
