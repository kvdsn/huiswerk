// Children using the app. Pure functions on a plain state object:
//   state = { profiles: [profile], current: profileId }
//   profile = { id, name, kind: 'school' | 'kleuter', palette: 'roze' | 'mint',
//               tellenMax: 5 | 10, memoryCards: 6 | 8 | 12 }
// The first child keeps the id 'p1', so her existing sticker book stays hers.

const KINDS = ['school', 'kleuter'];
const PALETTES = ['roze', 'mint'];

function makeProfile(id, { name = '', kind = 'school', palette } = {}) {
  return {
    id,
    name,
    kind,
    palette: palette || (kind === 'kleuter' ? 'mint' : 'roze'),
    tellenMax: 5,
    memoryCards: 6,
  };
}

/** One school child, named as in the old single-child settings. */
export function defaultProfiles(legacyName = '') {
  return { profiles: [makeProfile('p1', { name: legacyName })], current: 'p1' };
}

/** Makes stored data safe to use; falls back to one child. */
export function cleanProfiles(stored, legacyName = '') {
  const list = Array.isArray(stored?.profiles) ? stored.profiles : [];
  const seen = new Set();
  const profiles = [];
  for (const p of list) {
    if (typeof p?.id !== 'string' || seen.has(p.id)) continue;
    seen.add(p.id);
    const kind = KINDS.includes(p.kind) ? p.kind : 'school';
    profiles.push({
      ...makeProfile(p.id, { kind }),
      name: typeof p.name === 'string' ? p.name : '',
      palette: PALETTES.includes(p.palette) ? p.palette : kind === 'kleuter' ? 'mint' : 'roze',
      tellenMax: [5, 10].includes(p.tellenMax) ? p.tellenMax : 5,
      memoryCards: [6, 8, 12].includes(p.memoryCards) ? p.memoryCards : 6,
    });
  }
  if (!profiles.length) return defaultProfiles(legacyName);
  const current = profiles.some((p) => p.id === stored.current) ? stored.current : profiles[0].id;
  return { profiles, current };
}

export function currentProfile(state) {
  return state.profiles.find((p) => p.id === state.current) || state.profiles[0];
}

export function setCurrent(state, id) {
  return state.profiles.some((p) => p.id === id) ? { ...state, current: id } : state;
}

/** Adds a child (a kleuter by default) and returns { state, profile }. */
export function addProfile(state, { kind = 'kleuter', name = '' } = {}) {
  const used = new Set(state.profiles.map((p) => p.id));
  let n = 2;
  while (used.has(`p${n}`)) n++;
  const profile = makeProfile(`p${n}`, { kind, name });
  return { state: { ...state, profiles: [...state.profiles, profile] }, profile };
}

/** Removes a child; the last one can't be removed. */
export function removeProfile(state, id) {
  if (state.profiles.length <= 1) return state;
  const profiles = state.profiles.filter((p) => p.id !== id);
  if (profiles.length === state.profiles.length) return state;
  return { profiles, current: state.current === id ? profiles[0].id : state.current };
}

export function updateProfile(state, id, patch) {
  return {
    ...state,
    profiles: state.profiles.map((p) => {
      if (p.id !== id) return p;
      const next = { ...p, ...patch };
      // A new kind gets that kind's default colours unless chosen in the same change.
      if (patch.kind && patch.kind !== p.kind && !patch.palette) next.palette = patch.kind === 'kleuter' ? 'mint' : 'roze';
      return next;
    }),
  };
}

/** Where a child's sticker book is stored. The first child keeps the original key. */
export function stickerKey(id) {
  return id === 'p1' ? 'huiswerk.stickers.v1' : `huiswerk.stickers.${id}.v1`;
}
