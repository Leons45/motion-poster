# Motion Poster Engine

A zero-dependency prototype that replaces "pick a template, drag layers" with
**type a few fields → get several animated poster options in seconds.**

No build step, no npm install — it's plain HTML/CSS/JS. Open `index.html`
in a browser (or serve the folder) and it runs.

## How it works

```
input (headline, price, sale%, image, theme)
        ↓
layoutSolver.js   → computes every position/size from the data itself
                    (image aspect ratio, headline length, price digit count —
                    no fixed template, so it never clips or looks hand-tuned)
        ↓
themes.js         → one theme tag picks the whole palette + motion pacing
        ↓
variants.js       → auto-generates several copy/layout options from one input
        ↓
renderer.js        → single Canvas2D function draws every frame — the exact
                    same function used for the live preview AND the export,
                    so what you see is what you get
        ↓
app.js            → wires the form, renders a grid of options, exports
                    PNG (static) or WEBM (motion) per card
```

This is the core idea from our conversation: **the layout solver + renderer
are the same code path for preview and export**, and they're driven entirely
by data — not by hand-built templates — so adding a new product never means
building a new template.

## Using it

1. Open `index.html` (double-click, or `python3 -m http.server` then visit
   `localhost:8000`).
2. Fill in headline / price / sale % / theme, upload a product photo.
3. Hit **Generate options** → get 1–8 animated variants side by side,
   looping live in the browser.
4. Per card: **Save PNG** (static post) or **Export Motion (webm)**
   (short animated poster, ~3 seconds).

### Batch mode
Use the CSV panel to render a whole promo cycle in one go. Columns:
`headline,price,salePercent,theme,imageUrl` — see `sample-batch.csv`.
This is the "batch per promo" path we discussed: you paste/prepare the
sheet once per campaign rather than opening the form per product.

## What's real vs. prototype-level right now

- **Real**: the layout solver logic, the theme/motion system, the variant
  generator, the Canvas2D renderer, PNG + WEBM export. You can use this
  today for single posters and small batches.
- **Prototype-level / next steps**:
  - **Fonts**: swap in your actual licensed Proxima Nova files — see the
    commented `@font-face` block at the top of `index.html`.
  - **Export format**: WEBM, not MP4 (browsers can't encode H.264 without
    a paid codec license). For MP4/social-ready exports, run the same
    renderer server-side — this is exactly where the Remotion pipeline
    we discussed comes in (see "Upgrade path" below).
  - **Copy variants**: `variants.js` uses simple local templates
    (`"X — Today Only"`, `"Don't Miss: X"`). Swapping in a real Claude
    API call there would give you genuinely written headline options
    instead of templated ones — same pipeline, smarter copy step.
  - **Video export speed**: WEBM export runs in real time (a 3s poster
    takes ~3s to export) because it's captured via `MediaRecorder` in
    the browser. Fine for one-offs; for rendering a whole flyer's worth
    of products unattended, that's the upgrade path below.

## Upgrade path: when you outgrow the browser version

The layout solver (`layoutSolver.js`) and the render logic
(`renderer.js`) are written as plain functions with no DOM dependency
baked in — that's deliberate. The same math ports almost directly into a
Remotion (React) composition for server-side batch rendering: loop the
composition over an array of CSV rows, render all of them headlessly in
one script run, output real MP4s. That's the move once you're doing this
for 15–20 SKUs at a time instead of 1–5.

## GitHub Pages

This is plain static files, so it pushes straight to a repo and serves
via GitHub Pages with zero config — drop these files in, enable Pages on
`main`, and the link is `https://<you>.github.io/<repo>/`.
