import { computeLayout } from './layoutSolver.js';
import { getTheme, getMotion } from './themes.js';
import { renderFrame } from './renderer.js';
import { generateVariants } from './variants.js';

const CLIP_SECONDS = 3;
const FPS = 30;
const MASTER_SIZE = { w: 1080, h: 1350 }; // 4:5 feed post

const els = {
  form: document.getElementById('posterForm'),
  headline: document.getElementById('headline'),
  price: document.getElementById('price'),
  salePercent: document.getElementById('salePercent'),
  theme: document.getElementById('theme'),
  imageInput: document.getElementById('imageInput'),
  variantCount: document.getElementById('variantCount'),
  grid: document.getElementById('grid'),
  csvInput: document.getElementById('csvInput'),
  batchBtn: document.getElementById('batchBtn'),
  status: document.getElementById('status'),
};

let currentImage = null;
const measureCanvas = document.createElement('canvas');
const measureCtx = measureCanvas.getContext('2d');

els.imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  currentImage = await loadImage(URL.createObjectURL(file));
  setStatus(`Image loaded (${currentImage.width}×${currentImage.height}).`);
});

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function setStatus(msg) {
  els.status.textContent = msg;
}

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentImage) {
    setStatus('Add a product image first.');
    return;
  }
  const input = {
    headline: els.headline.value.trim() || 'Your Headline Here',
    price: els.price.value.trim(),
    salePercent: els.salePercent.value.trim(),
    theme: els.theme.value,
    imageAspect: currentImage.width / currentImage.height,
  };
  const count = parseInt(els.variantCount.value, 10) || 4;
  const variants = generateVariants(input, count);
  els.grid.innerHTML = '';
  variants.forEach((v) => addPosterCard(v, currentImage));
  setStatus(`Generated ${variants.length} options.`);
});

// ---- batch mode: one row of CSV -> one poster (not variants) ----
els.batchBtn.addEventListener('click', async () => {
  const file = els.csvInput.files[0];
  if (!file) {
    setStatus('Choose a CSV file first (headline,price,salePercent,theme,imageUrl).');
    return;
  }
  const text = await file.text();
  const rows = parseCsv(text);
  els.grid.innerHTML = '';
  setStatus(`Rendering ${rows.length} posters from CSV…`);

  for (const row of rows) {
    try {
      const img = await loadImage(row.imageUrl);
      addPosterCard(
        {
          headline: row.headline,
          price: row.price,
          salePercent: row.salePercent,
          theme: row.theme || 'leons-default',
          align: 'left',
          variantId: row.headline,
        },
        img
      );
    } catch (err) {
      console.warn('Skipped row (image failed to load):', row, err);
    }
  }
  setStatus(`Done. ${els.grid.children.length} posters rendered.`);
});

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => (row[h] = cells[i] || ''));
    return row;
  });
}

// ---- poster card: canvas + looping preview + export buttons ----
function addPosterCard(input, img) {
  const card = document.createElement('div');
  card.className = 'card';

  const canvas = document.createElement('canvas');
  const scale = 0.32; // preview scale
  canvas.width = MASTER_SIZE.w;
  canvas.height = MASTER_SIZE.h;
  canvas.style.width = `${MASTER_SIZE.w * scale}px`;
  canvas.style.height = `${MASTER_SIZE.h * scale}px`;
  const ctx = canvas.getContext('2d');

  const layout = computeLayout(input, MASTER_SIZE, measureCtx);
  const theme = getTheme(input.theme);
  const motion = getMotion(input.theme);

  let start = performance.now();
  let raf;
  function loop(now) {
    const elapsed = ((now - start) / 1000) % (CLIP_SECONDS + motion.hold);
    const t = Math.min(elapsed / CLIP_SECONDS, 1);
    renderFrame(ctx, { layout, theme, motion, img, t });
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  const label = document.createElement('div');
  label.className = 'cardLabel';
  label.textContent = input.headline;

  const actions = document.createElement('div');
  actions.className = 'cardActions';

  const pngBtn = document.createElement('button');
  pngBtn.textContent = 'Save PNG';
  pngBtn.onclick = () => {
    renderFrame(ctx, { layout, theme, motion, img, t: 1 }); // final, settled pose
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${slug(input.headline)}.png`;
    a.click();
  };

  const mp4Btn = document.createElement('button');
  mp4Btn.textContent = 'Export Motion (webm)';
  mp4Btn.onclick = () => exportVideo(canvas, layout, theme, motion, img, input);

  actions.append(pngBtn, mp4Btn);
  card.append(canvas, label, actions);
  els.grid.appendChild(card);

  card._cleanup = () => cancelAnimationFrame(raf);
}

function slug(s) {
  return (s || 'poster').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
}

function exportVideo(previewCanvas, layout, theme, motion, img, input) {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = layout.canvas.w;
  exportCanvas.height = layout.canvas.h;
  const ectx = exportCanvas.getContext('2d');

  const stream = exportCanvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
  const chunks = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug(input.headline)}.webm`;
    a.click();
    setStatus('Motion poster exported.');
  };

  setStatus('Rendering motion export…');
  recorder.start();
  const start = performance.now();
  const totalMs = (CLIP_SECONDS + motion.hold) * 1000;

  function frame(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / (CLIP_SECONDS * 1000), 1);
    renderFrame(ectx, { layout, theme, motion, img, t });
    if (elapsed < totalMs) {
      requestAnimationFrame(frame);
    } else {
      recorder.stop();
    }
  }
  requestAnimationFrame(frame);
}
