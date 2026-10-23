# Motion Poster Studio — v10 source

This is the editable source for `v10/index.html`. The published page is a
single self-contained HTML file; `build.py` concatenates these pieces into
it. **Never hand-edit `../index.html` directly** — edit the files here and
rebuild.

## Build

```
python3 build.py
```

Run it from this directory (or anywhere — it locates itself and writes to
`../index.html` either way). Requires only the Python 3 standard library.

## Files

- `body.html` — the page's DOM (template rail, canvas stage, inspector panel)
- `style.css` — all CSS, including the Leon's-branded chrome
- `assets.js` — embedded brand assets (logo, badges) as data URIs
- `helpers.js` — drawing primitives: text/wrap, shapes, the `objDraw`
  selection/drag/resize/rotate mechanism, the `fillTextHook` canvas proxy
  that makes arbitrary template text individually selectable
- `advanced.js`, `premium.js`, `premium2.js`, `community.js`, `classic.js`
  — template definitions, grouped by when/where they were added
- `leons.js` — shared Leon's-brand drawing helpers (`mastCircle`,
  `mastText`, `bottomArc`, `madeInCanada`, etc.) used across many templates
- `events.js` — the "Event Posts" system: 6 campaign categories
  (`EVENT_CATS`) × 5 shared structural layouts (`LAYOUTS`), each category a
  template in `T_EVENTS`
- `engine.js` — core state (`state`), the per-text/per-object override
  system (`ovFor`/`styleFor`/`ovProxy`, see comments there for how
  position vs. typography overrides are scoped differently), the Quick
  Leon's Elements sticker system, the free-canvas layer engine
- `ui.js` — DOM wiring: template rail, inspector panels, selection,
  undo/redo, persistence (`localStorage`), canvas pointer handling, video
  export

## Conventions worth knowing before editing

- **Override scoping**: position/size/rotation overrides are scoped per
  (template, ratio) via `ovKey(tid)` — a 1:1 post and a 9:16 post of the
  same template have independent transforms, since the canvas geometry
  genuinely differs. Typography overrides (weight, typeface, colour,
  letter/line spacing, opacity) are scoped per template only, shared
  across all its ratios, via `styleFor`. `ovProxy(tid)` merges both for
  drawing. See the comment block above `const OVD=` in `engine.js`.
- **Selectable text**: template `draw()` functions call the normal-looking
  `text(c,{...})` / `c.fillText(...)` helpers. Under the hood `c` is a
  Proxy (`PC` in `ui.js`) that routes `fillText` through `fillTextHook` in
  `engine.js`, which fuzzy-matches the drawn string back to a field key
  (via `matchKey`) so it can be dragged/resized/styled — no per-template
  wiring needed.
- **Multi-line headline spacing**: lay lines out as a tight block (roughly
  `fontSize * 1.08` apart) and centre that block in the available space,
  rather than spreading lines evenly across however much vertical room
  happens to be available — the latter looks fine until the available
  band is taller than the text needs, then one extra line creates a
  disproportionate gap (this bit us once in `mastText`, see its comments).
- Keep v9 (`../../v9/src/`) and v10 in sync by hand where a fix applies to
  both — they're forked, not shared, so there's no single source of truth
  to edit once. Check both when fixing a bug in `engine.js`/`ui.js`/
  `leons.js`, since those three files are nearly identical between the
  two versions.
