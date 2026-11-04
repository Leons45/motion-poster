/**
 * VARIANT GENERATOR
 * -----------------
 * Takes ONE input (product + price + theme) and produces several poster
 * options automatically — this is the "pick from options instead of
 * designing from scratch" step.
 *
 * Copy variants here use simple local templates so the tool works with
 * zero setup. Swap `buildCopyVariants` for a real call to the Claude API
 * (see README "Upgrade path") to get genuinely written headline options
 * instead of templated ones — the rest of the pipeline doesn't change.
 */

const COPY_STYLES = [
  (base) => base, // as typed
  (base) => `${base.replace(/\.$/, '')} — Today Only`,
  (base) => `Don't Miss: ${base}`,
];

function buildCopyVariants(headline) {
  const seen = new Set();
  return COPY_STYLES.map((fn) => fn(headline)).filter((h) => {
    if (seen.has(h)) return false;
    seen.add(h);
    return true;
  });
}

export function generateVariants(input, count = 4) {
  const copies = buildCopyVariants(input.headline || '');
  const aligns = ['left', 'right'];
  const out = [];

  let i = 0;
  while (out.length < count) {
    const headline = copies[i % copies.length];
    const align = aligns[Math.floor(i / copies.length) % aligns.length];
    out.push({ ...input, headline, align, variantId: `v${i + 1}` });
    i++;
    if (i > count * 2) break; // safety
  }
  return out;
}
