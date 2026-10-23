# Motion Poster Studio — v9 source

This is the editable source for `v9/index.html`. The published page is a
single self-contained HTML file; `build.py` concatenates these pieces into
it. **Never hand-edit `../index.html` directly** — edit the files here and
rebuild.

v9 is kept as a stable fallback behind v10 (`../../v10/`), which is the
actively developed "one-stop" version with Event Posts, category filters,
and Quick Leon's Elements. Fix bugs here too only if they affect v9
specifically; new features go in v10.

## Build

```
python3 build.py
```

Run it from this directory (or anywhere — it locates itself and writes to
`../index.html` either way). Requires only the Python 3 standard library.

## Files

Same structure as `../../v10/src/` minus `events.js` (v9 predates the
Event Posts system) — see that README for what each file does and the
override-scoping/selectable-text conventions shared by both versions.
