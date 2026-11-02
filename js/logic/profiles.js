// The two children using the app. Pure functions on a plain state object:
//   state = { profiles: [profile, profile], current: profileId }
//   profile = { id, name, kind: 'school' | 'kleuter', avatar: one of AVATAR_IDS,
//               tellenMax: 5 | 10, memoryCards: 6 | 8 | 12 }
// The two children never share an avatar.
// The family is fixed: 'p1' is the school child (she keeps the original
// sticker book and name), 'p2' the toddler.

export const AVATAR_IDS = ['eenhoorn', 'kat', 'konijn', 'panda', 'vos', 'uil', 'pinguin', 'draakje'];
const CHILDREN = [
  { id: 'p1', kind: 'school', avatar: 'eenhoorn' },
  { id: 'p2', kind: 'kleuter', avatar: 'kat' },
];

function makeProfile({ id, kind, avatar }, name = '') {
  return { id, name, kind, avatar, tellenMax: 5, memoryCards: 6 };
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
      // Older versions had unicorn colours instead of avatars: keep the default animal.
      avatar: AVATAR_IDS.includes(p.avatar) ? p.avatar : c.avatar,
      tellenMax: [5, 10].includes(p.tellenMax) ? p.tellenMax : 5,
      memoryCards: [6, 8, 12].includes(p.memoryCards) ? p.memoryCards : 6,
    };
  });
  // Never the same avatar twice: the second child gets the first free one.
  if (profiles[1].avatar === profiles[0].avatar) {
    profiles[1].avatar = AVATAR_IDS.find((a) => a !== profiles[0].avatar);
  }
  const current = profiles.some((p) => p.id === stored?.current) ? stored.current : 'p1';
  return { profiles, current };
}

export function currentProfile(state) {
  return state.profiles.find((p) => p.id === state.current) || state.profiles[0];
}

export function setCurrent(state, id) {
  return state.profiles.some((p) => p.id === id) ? { ...state, current: id } : state;
}

/** The avatar the other child has, which this child can't pick. */
export function takenAvatar(state, id) {
  return state.profiles.find((p) => p.id !== id)?.avatar;
}

/**
 * Changes a child's name, avatar or game settings (not her id or kind).
 * An unknown avatar, or one the other child has, is ignored.
 */
export function updateProfile(state, id, patch) {
  const { id: _id, kind: _kind, ...allowed } = patch;
  if ('avatar' in allowed && (!AVATAR_IDS.includes(allowed.avatar) || allowed.avatar === takenAvatar(state, id))) {
    delete allowed.avatar;
  }
  return { ...state, profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...allowed } : p)) };
}

/** Where a child's sticker book is stored. The first child keeps the original key. */
export function stickerKey(id) {
  return id === 'p1' ? 'huiswerk.stickers.v1' : `huiswerk.stickers.${id}.v1`;
}
