// The two children using the app. Pure functions on a plain state object:
//   state = { profiles: [profile, profile], current: profileId }
//   profile = { id, name, kind: 'school' | 'kleuter', palette: 'roze' | 'paars',
//               tellenMax: 5 | 10, memoryCards: 6 | 8 | 12 }
// The family is fixed: 'p1' is the school child (she keeps the original
// sticker book and name), 'p2' the toddler.

const PALETTES = ['roze', 'paars'];
const CHILDREN = [
  { id: 'p1', kind: 'school', palette: 'roze' },
  { id: 'p2', kind: 'kleuter', palette: 'paars' },
];

function makeProfile({ id, kind, palette }, name = '') {
  return { id, name, kind, palette, tellenMax: 5, memoryCards: 6 };
}

/** Both children, the first named as in the old single-child settings. */
export function defaultProfiles(legacyName = '') {
  return { profiles: CHILDREN.map((c, i) => makeProfile(c, i === 0 ? legacyName : '')), current: 'p1' };
}

/** Makes stored data safe to use: always the two children, in order. */
export function cleanProfiles(stored, legacyName = '') {
  const list = Array.isArray(stored?.profiles) ? stored.profiles : [];
  const profiles = CHILDREN.map((c, i) => {
    const p = list.find((item) => item?.id === c.id);
    if (!p) return makeProfile(c, i === 0 ? legacyName : '');
    return {
      ...makeProfile(c),
      name: typeof p.name === 'string' ? p.name : '',
      // 'mint' was the first colour for the second child; it became 'paars'.
      palette: p.palette === 'mint' ? 'paars' : PALETTES.includes(p.palette) ? p.palette : c.palette,
      tellenMax: [5, 10].includes(p.tellenMax) ? p.tellenMax : 5,
      memoryCards: [6, 8, 12].includes(p.memoryCards) ? p.memoryCards : 6,
    };
  });
  const current = profiles.some((p) => p.id === stored?.current) ? stored.current : 'p1';
  return { profiles, current };
}

export function currentProfile(state) {
  return state.profiles.find((p) => p.id === state.current) || state.profiles[0];
}

export function setCurrent(state, id) {
  return state.profiles.some((p) => p.id === id) ? { ...state, current: id } : state;
}

/** Changes a child's name, colour or game settings (not her id or kind). */
export function updateProfile(state, id, patch) {
  const { id: _id, kind: _kind, ...allowed } = patch;
  return { ...state, profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...allowed } : p)) };
}

/** Where a child's sticker book is stored. The first child keeps the original key. */
export function stickerKey(id) {
  return id === 'p1' ? 'huiswerk.stickers.v1' : `huiswerk.stickers.${id}.v1`;
}
