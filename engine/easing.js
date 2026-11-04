// Small self-contained easing library (no GSAP dependency needed for render,
// though GSAP is used in app.js for UI micro-interactions since that's
// already in your stack).

export const ease = {
  linear: (t) => t,
  cubic: (t) => 1 - Math.pow(1 - t, 3),
  sine: (t) => Math.sin((t * Math.PI) / 2),
  expo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  back: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  elastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp01(t) {
  return Math.min(1, Math.max(0, t));
}
