/**
 * LAYOUT SOLVER
 * -------------
 * Pure function: data in -> layout math out. No template files, no manual
 * placement. This is the piece that lets the engine produce correct layouts
 * for ANY product/copy combination, not just the ones someone designed for.
 *
 * It reasons about:
 *  - image aspect ratio (portrait product shot vs. wide room shot)
 *  - headline length (auto line-wrap + font-size step-down)
 *  - price digit count (badge auto-sizes so "$1,299" never clips)
 *  - canvas aspect ratio (square post / 4:5 feed / 9:16 story)
 *
 * Output is a plain object of rectangles + font sizes in canvas pixels.
 * The renderer just draws what this returns — it makes zero layout
 * decisions itself.
 */

function wrapHeadline(ctx, text, maxWidth, maxFontSize, minFontSize, fontFamily) {
  // Step font size down until the headline fits in <= 2 lines at maxWidth.
  let fontSize = maxFontSize;
  let lines = [];

  while (fontSize >= minFontSize) {
    ctx.font = `800 ${fontSize}px ${fontFamily}`;
    const words = text.split(' ');
    lines = [];
    let current = '';

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);

    if (lines.length <= 2) break;
    fontSize -= 4;
  }

  return { fontSize: Math.max(fontSize, minFontSize), lines };
}

/**
 * computeLayout
 * @param {Object} input
 *   headline, price, salePercent, theme, imageAspect (w/h), align ('left'|'right')
 * @param {Object} canvasSize { w, h }
 * @param {CanvasRenderingContext2D} measureCtx - any 2d ctx, used only to measure text
 * @returns {Object} layout
 */
export function computeLayout(input, canvasSize, measureCtx) {
  const { w: W, h: H } = canvasSize;
  const pad = Math.round(W * 0.07);
  const align = input.align || 'left';
  const imageAspect = input.imageAspect || 1; // width / height of source photo

  // ---- Image block -------------------------------------------------
  // Wide shots (room scenes) get a tall crop up top; tall/product shots
  // get a big hero block that fills most of the frame. This is the kind
  // of decision a human designer makes per-asset — here it's a rule.
  let imageBlock;
  if (imageAspect >= 1.3) {
    // wide / landscape source -> hero band across the top ~58%
    imageBlock = { x: 0, y: 0, w: W, h: Math.round(H * 0.58) };
  } else {
    // square-ish or portrait source -> full-bleed hero, text overlays bottom
    imageBlock = { x: 0, y: 0, w: W, h: Math.round(H * 0.72) };
  }

  // ---- Text safe zone ------------------------------------------------
  const textTop = imageBlock.h - Math.round(H * 0.16); // text block overlaps image bottom with a scrim
  const textZoneW = W - pad * 2;

  // ---- Headline --------------------------------------------------
  const maxHeadline = Math.round(W * 0.095);
  const minHeadline = Math.round(W * 0.05);
  const { fontSize: headlineSize, lines } = wrapHeadline(
    measureCtx,
    input.headline || '',
    textZoneW,
    maxHeadline,
    minHeadline,
    'Proxima Nova, Arial, sans-serif'
  );
  const lineHeight = headlineSize * 1.08;
  const headlineBlockH = lines.length * lineHeight;

  const headlineY = textTop + Math.round(H * 0.07);

  // ---- Price badge ---------------------------------------------------
  // Measure the actual text (not a digit-count guess) so the badge always
  // fits what will really be drawn, however many digits the price has.
  const priceText = input.price || '';
  const priceDigits = priceText.replace(/[^0-9]/g, '').length;
  let priceFont = priceDigits > 5 ? Math.round(W * 0.085) : Math.round(W * 0.1);
  const badgePadX = Math.round(W * 0.035);

  measureCtx.font = `900 ${priceFont}px Proxima Nova, Arial, sans-serif`;
  let textW = measureCtx.measureText(priceText).width;
  const maxBadgeW = W - pad * 2;

  // step the font down further if even the measured text would overflow
  // the available width (very long prices on a narrow canvas)
  while (textW + badgePadX * 2 > maxBadgeW && priceFont > Math.round(W * 0.045)) {
    priceFont -= 3;
    measureCtx.font = `900 ${priceFont}px Proxima Nova, Arial, sans-serif`;
    textW = measureCtx.measureText(priceText).width;
  }

  const badgeW = Math.min(maxBadgeW, Math.round(textW + badgePadX * 2));
  const badgeH = Math.round(priceFont * 1.7);
  const badgeX = align === 'left' ? pad : W - pad - badgeW;
  const badgeY = H - pad - badgeH;

  // ---- Sale ribbon (optional) --------------------------------------
  const hasSale = !!input.salePercent;

  return {
    canvas: { w: W, h: H },
    align,
    image: imageBlock,
    scrim: { x: 0, y: imageBlock.h - Math.round(H * 0.22), w: W, h: Math.round(H * 0.22) },
    headline: {
      x: pad,
      y: headlineY,
      maxWidth: textZoneW,
      fontSize: headlineSize,
      lineHeight,
      lines,
      align,
    },
    price: {
      x: badgeX,
      y: badgeY,
      w: badgeW,
      h: badgeH,
      fontSize: priceFont,
      text: input.price || '',
    },
    sale: hasSale
      ? {
          x: align === 'left' ? W - pad : pad,
          y: pad,
          r: Math.round(W * 0.08),
          text: `${input.salePercent}%\nOFF`,
          anchorRight: align === 'left',
        }
      : null,
    pad,
  };
}
