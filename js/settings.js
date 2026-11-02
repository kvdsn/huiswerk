// Settings stored on this device. Nothing else is saved.

const KEY = 'huiswerk.settings.v1';

export const DEFAULTS = {
  enabledPackages: [1, 2, 3, 4, 5, 6, 7],
  math: {
    max: 100,
    ops: { plus: true, min: true, maal: true },
    tables: [1, 2, 3, 4, 5],
    count: 10,
  },
  name: '',
  sounds: true,
  voiceURI: '',
  rate: 0.9,
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!stored) return clone(DEFAULTS);
    return {
      ...clone(DEFAULTS),
      ...stored,
      math: { ...clone(DEFAULTS.math), ...stored.math, ops: { ...DEFAULTS.math.ops, ...stored.math?.ops } },
    };
  } catch {
    return clone(DEFAULTS);
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Private mode or storage blocked: settings just won't persist.
  }
}
