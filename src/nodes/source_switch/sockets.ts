// Keeps the node's sockets in line with the config. Only public node APIs are used
// (addInput/removeInput/addOutput/removeOutput/connect), so the frontend's own
// link bookkeeping stays correct.
import type { ComfyNode } from "../../shared/comfy";
import { desiredInputs, INPUT_NAME, inputName, sourceLabel, type SwitchConfig } from "./model";

const ANY = "*";

const isManaged = (name: string) => INPUT_NAME.test(name);
const channelOf = (name: string) => Number(INPUT_NAME.exec(name)![2]);

function managedNames(node: ComfyNode): string[] {
  return node.inputs.filter((i) => isManaged(i.name)).map((i) => i.name);
}

/** Detected type per channel: the type of any connected input in that channel. */
export function channelTypes(node: ComfyNode, cfg: SwitchConfig): string[] {
  const types: string[] = cfg.channels.map(() => ANY);
  // getInputLink throws while the node is being created and isn't in a graph yet.
  if (!node.graph) return types;
  node.inputs.forEach((input, i) => {
    if (!isManaged(input.name)) return;
    const link = node.getInputLink(i);
    const c = channelOf(input.name);
    if (link && c < types.length && types[c] === ANY && link.type && link.type !== ANY) types[c] = link.type;
  });
  return types;
}

/** Remove every managed input in reverse order, returning what was connected to each. */
function detachAll(node: ComfyNode) {
  const links = new Map<string, { originId: number | string; originSlot: number }>();
  for (let i = node.inputs.length - 1; i >= 0; i--) {
    const { name } = node.inputs[i];
    if (!isManaged(name)) continue;
    const link = node.getInputLink(i);
    if (link) links.set(name, { originId: link.origin_id, originSlot: link.origin_slot });
    node.removeInput(i);
  }
  return links;
}

function reconnect(node: ComfyNode, links: Map<string, { originId: number | string; originSlot: number }>) {
  for (const [name, { originId, originSlot }] of links) {
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

  // Appending keeps the order only if what exists is already a prefix of the desired order.
  const current = managedNames(node);
  if (current.every((name, i) => desired[i] === name)) {
    for (const name of desired.slice(current.length)) node.addInput(name, ANY);
  } else {
    const links = detachAll(node);
    for (const name of desired) node.addInput(name, ANY);
    reconnect(node, links);
  }

  while (node.outputs.length > cfg.channels.length) node.removeOutput(node.outputs.length - 1);
  while (node.outputs.length < cfg.channels.length) node.addOutput(`out${node.outputs.length}`, ANY);

  relabel(node, cfg);
}

/** Labels and types only; cheap enough to run on every connection change. */
export function relabel(node: ComfyNode, cfg: SwitchConfig) {
  const types = channelTypes(node, cfg);
  const channelName = (c: number) => cfg.channels[c]?.name || (types[c] !== ANY ? types[c] : `out ${c + 1}`);
  const sources = new Map(cfg.sources.map((s) => [s.slot, sourceLabel(s)]));

  for (const input of node.inputs) {
    const m = INPUT_NAME.exec(input.name);
    if (!m) continue;
    const c = Number(m[2]);
    input.label = `${sources.get(Number(m[1])) ?? "?"} · ${channelName(c)}`;
    input.type = types[c] ?? ANY;
  }
  node.outputs.forEach((output, c) => {
    output.label = channelName(c);
    output.type = types[c] ?? ANY;
  });
  node.setDirtyCanvas(true, true);
}

/**
 * Removes channel `c`: drops its output (the frontend shifts later links down) and
 * its inputs, then renames later channels' inputs so channel slot == position again.
 */
export function removeChannelSockets(node: ComfyNode, c: number) {
  if (c < node.outputs.length) node.removeOutput(c);
  for (let i = node.inputs.length - 1; i >= 0; i--) {
    const m = INPUT_NAME.exec(node.inputs[i].name);
    if (!m) continue;
    const ch = Number(m[2]);
    if (ch === c) node.removeInput(i);
    else if (ch > c) node.inputs[i].name = inputName(Number(m[1]), ch - 1);
  }
}
