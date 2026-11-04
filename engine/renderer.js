import { ease, lerp, clamp01 } from './easing.js';

/**
 * RENDERER
 * --------
 * Pure Canvas2D. Same function draws a single preview frame AND every frame
 * of an exported video — there is no separate "export renderer," so what
 * you see in the browser is exactly what gets exported. t is normalized
 * progress through the clip, 0..1.
 */

function drawImageCover(ctx, img, rect) {
  if (!img) return;
  const ir = img.width / img.height;
  const rr = rect.w / rect.h;
  let sw, sh, sx, sy;
  if (ir > rr) {
    sh = img.height;
    sw = sh * rr;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / rr;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, rect.x, rect.y, rect.w, rect.h);
}

export function renderFrame(ctx, { layout, theme, motion, img, t }) {
  const { w: W, h: H } = layout.canvas;
  t = clamp01(t);

  // timeline splits, scaled by this theme's motion speed
  const introEnd = Math.min(0.45, Math.max(0.12, 0.28 / motion.speed));
  const priceStart = introEnd * 0.55;
  const priceEnd = Math.min(0.75, priceStart + 0.22 / motion.speed);

  // ---- background ----
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);

  // ---- image, Ken Burns ----
  const kb = lerp(1.0, motion.kenBurns, ease.sine(t));
  ctx.save();
  ctx.beginPath();
  ctx.rect(layout.image.x, layout.image.y, layout.image.w, layout.image.h);
  ctx.clip();
  const cx = layout.image.x + layout.image.w / 2;
  const cy = layout.image.y + layout.image.h / 2;
  ctx.translate(cx, cy);
  ctx.scale(kb, kb);
  ctx.translate(-cx, -cy);
  drawImageCover(ctx, img, layout.image);
  ctx.restore();

  // ---- scrim gradient for text legibility ----
  const scrimAlpha = ease.sine(clamp01(t / introEnd));
  const grad = ctx.createLinearGradient(0, layout.scrim.y, 0, layout.scrim.y + layout.scrim.h);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, theme.scrim);
  ctx.save();
  ctx.globalAlpha = scrimAlpha;
  ctx.fillStyle = grad;
  ctx.fillRect(layout.scrim.x, layout.scrim.y, layout.scrim.w, layout.scrim.h * 2);
  ctx.restore();

  // solid lower panel behind text (keeps text legible regardless of photo)
  ctx.save();
  ctx.globalAlpha = scrimAlpha;
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, layout.headline.y - H * 0.05, W, H - (layout.headline.y - H * 0.05));
  ctx.restore();

  // ---- headline (slide up + fade, staggered per line) ----
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.text;
  layout.headline.lines.forEach((line, i) => {
    const stagger = i * 0.06;
    const lt = clamp01((t - stagger) / Math.max(0.001, introEnd - stagger));
    const eased = ease[motion.headlineEase] ? ease[motion.headlineEase](lt) : ease.cubic(lt);
    const yOffset = lerp(24, 0, eased);
    const alpha = eased;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `800 ${layout.headline.fontSize}px "Proxima Nova", Arial, sans-serif`;
    ctx.textAlign = layout.headline.align === 'right' ? 'right' : 'left';
    const x = layout.headline.align === 'right' ? layout.headline.x + layout.headline.maxWidth : layout.headline.x;
    const y = layout.headline.y + i * layout.headline.lineHeight + yOffset;
    ctx.fillText(line, x, y);
    ctx.restore();
  });

  // ---- price badge (pop in) ----
  if (layout.price.text) {
    const pt = clamp01((t - priceStart) / Math.max(0.001, priceEnd - priceStart));
    const eased = ease[motion.priceEase] ? ease[motion.priceEase](pt) : ease.back(pt);
    const scale = lerp(0.4, 1, eased);
    const alpha = clamp01(pt * 1.3);

    const { x, y, w, h, fontSize, text } = layout.price;
    const bx = x + w / 2;
    const by = y + h / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(bx, by);
    ctx.scale(scale, scale);
    ctx.translate(-bx, -by);

    ctx.fillStyle = theme.accent;
    roundRect(ctx, x, y, w, h, h * 0.18);
    ctx.fill();

    ctx.fillStyle = theme.accentText;
    ctx.font = `900 ${fontSize}px "Proxima Nova", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx, by + fontSize * 0.03);
    ctx.restore();
  }

  // ---- sale ribbon ----
  if (layout.sale) {
    const st = clamp01((t - priceStart * 0.6) / Math.max(0.001, introEnd));
    const eased = ease.back(st);
    const scale = lerp(0.3, 1, eased);
    const { x, y, r, text } = layout.sale;
    const ccx = layout.sale.anchorRight ? x - r : x + r;
    const ccy = y + r;

    ctx.save();
    ctx.globalAlpha = clamp01(st * 1.3);
    ctx.translate(ccx, ccy);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = theme.accent;
    ctx.fill();
    ctx.fillStyle = theme.accentText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = text.split('\n');
    const fs = r * 0.32;
    ctx.font = `900 ${fs}px "Proxima Nova", Arial, sans-serif`;
    lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * fs * 1.05));
    ctx.restore();
  }

  // ---- brand accent bar (constant, grounds the composition) ----
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, H - 6, W, 6);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
