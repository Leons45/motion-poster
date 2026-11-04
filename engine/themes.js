/**
 * THEME SYSTEM
 * ------------
 * One tag picks a whole visual + motion identity. This is what replaces
 * "choose a template" — you type a promo tag, the engine picks the palette,
 * accent, scrim style and motion pacing for you.
 */

export const THEMES = {
  'black-friday': {
    accent: '#FFD400',
    accentText: '#111111',
    bg: '#0B0B0D',
    text: '#FFFFFF',
    scrim: 'rgba(0,0,0,0.78)',
    motion: 'punchy', // fast snaps, hard pop on price
  },
  clearance: {
    accent: '#E8352E',
    accentText: '#FFFFFF',
    bg: '#161616',
    text: '#FFFFFF',
    scrim: 'rgba(0,0,0,0.65)',
    motion: 'urgent',
  },
  'new-arrival': {
    accent: '#111111',
    accentText: '#FFFFFF',
    bg: '#F5F3EF',
    text: '#111111',
    scrim: 'rgba(245,243,239,0.0)',
    motion: 'elegant', // slow Ken Burns, gentle fades
  },
  'leons-default': {
    accent: '#C8102E', // Leon's red
    accentText: '#FFFFFF',
    bg: '#111111',
    text: '#FFFFFF',
    scrim: 'rgba(0,0,0,0.6)',
    motion: 'standard',
  },
};

export const MOTION_PRESETS = {
  punchy: { kenBurns: 1.06, headlineEase: 'back', priceEase: 'elastic', hold: 0.55, speed: 1.25 },
  urgent: { kenBurns: 1.08, headlineEase: 'expo', priceEase: 'back', hold: 0.5, speed: 1.4 },
  elegant: { kenBurns: 1.1, headlineEase: 'sine', priceEase: 'sine', hold: 0.6, speed: 0.8 },
  standard: { kenBurns: 1.07, headlineEase: 'cubic', priceEase: 'back', hold: 0.55, speed: 1.0 },
};

export function getTheme(tag) {
  return THEMES[tag] || THEMES['leons-default'];
}

export function getMotion(tag) {
  const theme = getTheme(tag);
  return MOTION_PRESETS[theme.motion] || MOTION_PRESETS.standard;
}
