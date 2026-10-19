# comfyui-marti

Personal ComfyUI node pack.

| Node | What it does |
|---|---|
| **LoRA Deck** (`LoraDeck`) | Any number of LoRAs in one node, each with a toggle and strength |

## LoRA Deck

Connect `model` (and `clip` only if your LoRAs train the text encoder).

| Action | How |
|---|---|
| Add a LoRA | **+ Add LoRA**, type to fuzzy-search, Enter |
| Swap a LoRA | Click its name |
| Toggle | Click the switch, or press and drag down several switches |
| Toggle all | Header switch |
| Strength | Drag left/right to scrub · click to type · arrow keys · double-click resets to 1.00 |
| Fine / coarse | Hold Shift (×0.1) or Ctrl (×10) while scrubbing or using arrows |
| Remove | Hover the row, click × |

Rows whose file is missing are outlined in red, and the queue refuses to run
with an enabled missing LoRA rather than silently skipping it.

Widget value (schema v1), defined in `marti/lora_deck/deck.py` and
`src/nodes/lora_deck/model.ts` (change both together and bump `version`):

```json
{ "version": 1,
  "rows": [{ "id": "k3j2", "on": true, "lora": "styles/ink.safetensors",
             "strength": 0.8, "strengthClip": null }] }
```

## ntfy notifications

Set **Settings → Marti → ntfy topic** and every job you queue pings that topic
when it finishes or fails. Leave the topic empty to turn it off.

- Title: the workflow name and how long the job took. Failures also say which
  node failed and why.
- The job's main saved output (the same one the queue uses as its thumbnail,
  never a temp preview) is attached. Turn off **Attach the result image** if the
  topic is public. Anyone who knows the topic name can read it.
- **ntfy server** defaults to `https://ntfy.sh`.

It runs in the browser tab that queued the job, so that tab has to stay open.

## Layout

```
__init__.py              V3 entrypoint listing every node, WEB_DIRECTORY
marti/<node>/            Python per node (pure logic kept free of ComfyUI imports)
src/
  index.ts               registers one frontend extension for the whole pack
  shared/                building blocks every node reuses
    comfy.ts             the only file touching ComfyUI frontend globals
    widget.ts            mounts a DOM view as a widget (sizing, save/load, cleanup)
    dom.ts               h() element helper, keyed list rendering, canvas isolation
    toggle.ts scrubber.ts picker.ts   controls
    modelFolder.ts       cached file list for any models/ folder
    number.ts text.ts value.ts        pure helpers
    theme.css            theme tokens (mt-*) and control styles
  nodes/<node>/          view, model and styles for one node, exported as a MartiNode
web/marti.js             built bundle (committed; ComfyUI loads it directly)
tests/                   Python (unittest) and TS (node:test)
```

### Adding a node

1. Python: `marti/<node>/node.py`, add it to the list in `__init__.py`. Prefix new
   node ids with `Marti` to avoid clashing with other packs.
2. Frontend (only if it needs a custom widget): `src/nodes/<node>/index.ts`
   exporting a `MartiNode`, added to `NODES` in `src/index.ts`. Use the shared
   controls and the `mt-` classes; prefix node-specific classes.

## Development

```sh
npm install
npm run watch        # rebuild web/ on save, then refresh the browser
npm run check        # typecheck + TS tests + production build
python -m unittest tests.test_lora_deck   # from this folder, with ComfyUI's python
```

Commit the rebuilt `web/marti.js` with source changes. Python changes need a
ComfyUI restart; frontend changes only need a browser refresh.
