// The children using the app, stored on this device only.

import { cleanProfiles } from './logic/profiles.js';

const KEY = 'huiswerk.profiles.v1';

/** legacyName: the name from the old single-child settings, for the first child. */
export function loadProfiles(legacyName = '') {
  try {
    return cleanProfiles(JSON.parse(localStorage.getItem(KEY) || 'null'), legacyName);
  } catch {
    return cleanProfiles(null, legacyName);
  }
}

export function saveProfiles(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: changes last until the app is closed.
  }
}
