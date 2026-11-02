// All selectable avatars, in the order they are offered. Each file follows CONTRACT.md.
import eenhoorn from './eenhoorn.js';
import kat from './kat.js';
import konijn from './konijn.js';
import panda from './panda.js';
import vos from './vos.js';
import uil from './uil.js';
import pinguin from './pinguin.js';
import draakje from './draakje.js';

export const AVATARS = [eenhoorn, kat, konijn, panda, vos, uil, pinguin, draakje];
export const AVATAR_IDS = AVATARS.map((a) => a.id);
