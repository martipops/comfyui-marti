# LoRA Deck

A multi-LoRA loader for ComfyUI with a proper UI: one node, any number of LoRAs,
each with its own on/off switch and strength.

## Using it

Add **LoRA Deck** (category `loaders`, or search "lora"). Connect `model` (and
`clip` only if your LoRAs train the text encoder), then:

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

## Layout

```
__init__.py          V3 entrypoint + WEB_DIRECTORY
lora_deck/
  deck.py            widget value schema, parsing (pure, unit-tested)
  cache.py           size-bounded LRU of loaded LoRA files (pure, unit-tested)
  nodes.py           the ComfyUI node
src/                 TypeScript frontend
  model.ts           widget value schema, mirrors deck.py
  loras.ts           shared, cached LoRA file list
  comfy.ts           the only place that touches ComfyUI frontend globals
  index.ts           extension + DOM widget glue
  ui/                deckView, picker (singleton), scrubber, toggle, dom helpers
  styles.css         uses ComfyUI theme variables
web/lora_deck.js     built bundle (committed; ComfyUI loads it directly)
tests/               Python (unittest) and TS (node:test) tests
```

### Widget value (schema v1)

```json
{ "version": 1,
  "rows": [{ "id": "k3j2", "on": true, "lora": "styles/ink.safetensors",
             "strength": 0.8, "strengthClip": null }] }
```

`strengthClip: null` means "same as strength". Change the schema in
`lora_deck/deck.py` **and** `src/model.ts` together, and bump `version`.

## Development

```sh
npm install
npm run watch        # rebuild web/ on save, then refresh the browser
npm run check        # typecheck + TS tests + production build
python -m unittest tests.test_deck   # run from this folder with ComfyUI's python
```

Commit the rebuilt `web/lora_deck.js` with source changes. Python changes need a
ComfyUI restart; frontend changes only need a browser refresh.
