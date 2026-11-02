// Mascot: a small friendly animal (the child's chosen avatar) that reacts to answers.
// No dependencies. Usage:
//   import { mountMascot } from './ui/mascot.js';
//   const m = mountMascot(document.querySelector('#mascot'), { avatar: 'panda' });
//   m.react('happy');      // jump + paw clap (~600 ms)
//   m.react('encourage');  // gentle nod (~500 ms)
//   m.wear(['regenboog', 'konijntje']); // accessories: regenboog, schelpenkroon, konijntje, planeet
//   m.avatar('vos');       // switch animal live (worn rewards stay)
// The animals live in ./avatars/ (one file each, see ./avatars/CONTRACT.md);
// the rewards and all reactions are shared and drawn around any avatar.

import { AVATARS } from './avatars/index.js';

export { AVATARS };
export const AVATAR_IDS = AVATARS.map((a) => a.id);
export const MASCOT_ACCESSORIES = ['regenboog', 'schelpenkroon', 'konijntje', 'planeet'];
const DEFAULT_AVATAR = 'eenhoorn';
const BY_ID = new Map(AVATARS.map((a) => [a.id, a]));
// the old colour palettes ('roze', 'paars', alias 'mint') were all unicorns
const PALETTE_AVATAR = { roze: 'eenhoorn', paars: 'eenhoorn', mint: 'eenhoorn' };

const findAvatar = (id) => BY_ID.get(id) ?? BY_ID.get(DEFAULT_AVATAR);

/** { id, noun, article } of an avatar (unknown ids give the unicorn), e.g. for "de eenhoorn". */
export function avatarInfo(id) {
  const { id: aid, noun, article } = findAvatar(id);
  return { id: aid, noun, article };
}

// Accessories are always in the SVG but hidden until they get the class
// "is-worn". Each lives in the group it should move with.
const rainbowArc = (r, c) => `<path d="M${100 - r} 178A${r} ${r} 0 0 1 ${100 + r} 178" stroke="${c}"/>`;
const cloud = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-17 6C-23 6-23-4-16-5C-16-13-6-15-2-9C1-17 13-16 13-7C20-8 22 6 15 6Z" fill="#f4f9ff" stroke="#c7d6ef" stroke-width="2.5" stroke-linejoin="round"/><path d="M-11-4Q-10-8-6-8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`;

// a small scallop shell, hinge at the local origin, opening upwards
const shell = (x, y, rot, s, fill, line) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`
  + `<path d="M-4 0H4L3 4H-3Z" fill="${line}" stroke="${line}" stroke-width="1.5" stroke-linejoin="round"/>`
  + `<path d="M0 1L-11-9C-13-13-11-17-8-17C-7-21-2-22 0-19C2-22 7-21 8-17C11-17 13-13 11-9Z" fill="${fill}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`
  + `<path d="M0 0L-6-14M0 0V-17M0 0L6-14" fill="none" stroke="${line}" stroke-width="1.5" stroke-linecap="round"/></g>`;
const pearl = (x, y, r = 3.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffaf2" stroke="#d8c3e8" stroke-width="1.5"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.3}" fill="#fff"/>`;

const orbitStar = (R) => `<path d="M0 ${-R}Q${R * 0.22} ${-R * 0.22} ${R} 0Q${R * 0.22} ${R * 0.22} 0 ${R}Q${-R * 0.22} ${R * 0.22} ${-R} 0Q${-R * 0.22} ${-R * 0.22} 0 ${-R}Z" fill="#ffe27a" stroke="#e8b94a" stroke-width="1.8" stroke-linejoin="round"/>`;
// items on a circle of radius 96 around (100 96): far enough out to never cover the face
const orbitAt = (deg, inner) => {
  const a = (deg * Math.PI) / 180;
  const x = +(100 + 96 * Math.cos(a)).toFixed(1);
  const y = +(96 + 96 * Math.sin(a)).toFixed(1);
  return `<g transform="translate(${x} ${y})"><g class="acc-orbit-item">${inner}</g></g>`;
};
const PLANET = '<g transform="rotate(-20) scale(1.3)">'
  + '<path d="M-17 0A17 5.5 0 0 1 17 0" fill="none" stroke="#f2bf4f" stroke-width="3.5" stroke-linecap="round"/>'
  + '<circle r="10.5" fill="#ffb3d9" stroke="#e48fbf" stroke-width="2"/><path d="M-9.5-4Q0-1 9.5-4.5M-9 4Q0 7 9 3.5" fill="none" stroke="#ffd1e8" stroke-width="2.4" stroke-linecap="round"/>'
  + '<path d="M-17 0A17 5.5 0 0 0 17 0" fill="none" stroke="#ffd36e" stroke-width="3.5" stroke-linecap="round"/>'
  + '<circle cx="-4" cy="-5" r="2" fill="#fff" opacity=".8"/></g>';

// The crown is drawn in its own coordinates with its centre-bottom at
// (100 62); each avatar's crown {x, y, scale} moves it onto that animal's head.
const CROWN_ANCHOR = { x: 100, y: 62 };
const CROWN = `
    <g class="acc acc-schelpenkroon">
      <path d="M72 50Q86 46 92 50L91 59Q84 56 73 59ZM108 50Q114 46 128 50L127 59Q116 56 109 59Z" fill="#a8e6cf" stroke="#7fcfae" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M88 52Q100 57 112 52L111 60Q100 64 89 60Z" fill="#a8e6cf" stroke="#7fcfae" stroke-width="2.2" stroke-linejoin="round"/>
      ${shell(73, 52, -32, 0.85, '#d9c6fa', '#b48ad6')}${shell(127, 52, 32, 0.85, '#d9c6fa', '#b48ad6')}
      ${shell(85, 50, -10, 1.1, '#ffc0dc', '#e48fbf')}${shell(115, 50, 10, 1.1, '#ffc0dc', '#e48fbf')}
      ${pearl(79, 56, 2.6)}${pearl(92, 56.5, 2.8)}${pearl(100, 59, 3.4)}${pearl(108, 56.5, 2.8)}${pearl(121, 56, 2.6)}
    </g>
`;

const REWARDS_BEHIND = `
  <!-- accessory: rainbow (behind everything) -->
  <g class="acc acc-regenboog">
    <g class="acc-rainbow" fill="none" stroke-width="10.5">
      ${rainbowArc(116, '#ffb3d9')}${rainbowArc(106, '#ffe08a')}${rainbowArc(96, '#a8e6cf')}${rainbowArc(86, '#c8b2f5')}
    </g>
    ${cloud(-1, 176)}${cloud(201, 176)}
  </g>

`;

const REWARDS_FRONT = `
  <!-- accessory: a little planet and stars circling the unicorn (behind the bunny) -->
  <g class="acc acc-planeet">
    <g class="acc-orbit">
      ${orbitAt(214, PLANET)}${orbitAt(316, orbitStar(8))}${orbitAt(350, orbitStar(5.5))}${orbitAt(152, orbitStar(6.5))}
    </g>
  </g>

  <!-- accessory: bunny friend, bottom right in front of the body -->
  <g class="acc acc-konijntje">
    <g transform="translate(182 159) scale(1.3)"><g class="acc-bunny">
      <g class="acc-bunny-ear acc-bunny-ear-l"><ellipse cx="-6" cy="-24" rx="5" ry="12" transform="rotate(-12 -6 -24)" fill="#f1e8fc" stroke="#c79bd8" stroke-width="2.2"/><ellipse cx="-6" cy="-23" rx="2.3" ry="8" transform="rotate(-12 -6 -23)" fill="#ffc6e2"/></g>
      <g class="acc-bunny-ear acc-bunny-ear-r"><ellipse cx="6" cy="-24" rx="5" ry="12" transform="rotate(12 6 -24)" fill="#f1e8fc" stroke="#c79bd8" stroke-width="2.2"/><ellipse cx="6" cy="-23" rx="2.3" ry="8" transform="rotate(12 6 -23)" fill="#ffc6e2"/></g>
      <circle cx="13" cy="20" r="4.5" fill="#fff" stroke="#c79bd8" stroke-width="2"/>
      <ellipse cx="0" cy="16" rx="14" ry="12" fill="#f1e8fc" stroke="#c79bd8" stroke-width="2.2"/>
      <ellipse cx="-8" cy="27" rx="6.5" ry="3.8" fill="#f1e8fc" stroke="#c79bd8" stroke-width="2"/><ellipse cx="8" cy="27" rx="6.5" ry="3.8" fill="#f1e8fc" stroke="#c79bd8" stroke-width="2"/>
      <ellipse cx="-4.5" cy="13" rx="3" ry="4" fill="#fff" stroke="#c79bd8" stroke-width="1.6"/><ellipse cx="4.5" cy="13" rx="3" ry="4" fill="#fff" stroke="#c79bd8" stroke-width="1.6"/>
      <circle cx="0" cy="-5" r="12.5" fill="#f1e8fc" stroke="#c79bd8" stroke-width="2.2"/>
      <ellipse cx="-7.5" cy="-1" rx="2.6" ry="1.6" fill="#ff7fae" opacity=".55"/><ellipse cx="7.5" cy="-1" rx="2.6" ry="1.6" fill="#ff7fae" opacity=".55"/>
      <circle cx="-4.5" cy="-6" r="1.9" fill="#4a3266"/><circle cx="4.5" cy="-6" r="1.9" fill="#4a3266"/><circle cx="-3.9" cy="-6.7" r=".65" fill="#fff"/><circle cx="5.1" cy="-6.7" r=".65" fill="#fff"/>
      <path d="M-1.4-3H1.4L0-1.6Z" fill="#ff7fae" stroke="#ff7fae" stroke-width="1" stroke-linejoin="round"/>
      <path d="M-2.4-.6Q0 1.6 2.4-.6" fill="none" stroke="#4a3266" stroke-width="1.3" stroke-linecap="round"/>
    </g></g>
  </g>
`;

function crownMarkup({ x, y, scale = 1 }) {
  const t = `translate(${x} ${y}) scale(${scale}) translate(${-CROWN_ANCHOR.x} ${-CROWN_ANCHOR.y})`;
  return `<g transform="${t}">${CROWN.trim()}</g>`;
}

// Put the crown where the avatar marks {crown}, or else last inside .mascot-head.
function withCrown(markup, crown) {
  if (markup.includes('{crown}')) return markup.replace('{crown}', crown);
  const open = markup.search(/<g\b[^>]*class="[^"]*\bmascot-head\b/);
  if (open < 0) return markup + crown;
  const tags = /<g\b[^>]*?(\/?)>|<\/g>/g;
  tags.lastIndex = open;
  let depth = 0;
  for (let m; (m = tags.exec(markup));) {
    if (m[0] === '</g>') depth -= 1;
    else if (!m[1]) depth += 1;
    if (depth === 0) return markup.slice(0, m.index) + crown + markup.slice(m.index);
  }
  return markup + crown;
}

/** The inside of the mascot <svg> for one avatar; ids are made unique with `uid`. */
function mascotInner(avatar, uid) {
  const inner = `
  <defs>${avatar.defs || ''}
  </defs>
${REWARDS_BEHIND}${withCrown(avatar.markup, crownMarkup(avatar.crown || CROWN_ANCHOR))}

${REWARDS_FRONT}`;
  return inner.replaceAll('{uid}', `mascot-${uid}`);
}

const capital = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/** Full SVG markup as a string (no DOM needed): for review pages and tests. */
export function mascotSVG({ avatar = DEFAULT_AVATAR, wear = [], uid = 'x' } = {}) {
  const a = findAvatar(avatar);
  const on = new Set(wear);
  const inner = mascotInner(a, uid).replace(/class="acc acc-([a-z]+)"/g,
    (m, id) => (on.has(id) ? `class="acc acc-${id} is-worn"` : m));
  return `<svg class="mascot avatar-${a.id}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${capital(a.noun)}">${inner}</svg>`;
}

// Shared CSS for every avatar (reactions, blink, idle bob, rewards). Each
// avatar's own `css` is added after it, once per page.
export const mascotCSS = `
.mascot { display: block; width: 100%; height: auto; overflow: visible; }
.mascot .mascot-body,
.mascot .mascot-head,
.mascot .mascot-eyes,
.mascot .mascot-tail,
.mascot .mascot-hoof-left,
.mascot .mascot-hoof-right { transform-box: fill-box; }
.mascot .mascot-head { transform-origin: 50% 92%; }
.mascot .mascot-eyes { transform-origin: 50% 50%; }
.mascot .mascot-tail { transform-origin: 0% 50%; }
.mascot .mascot-hoof-left,
.mascot .mascot-hoof-right { transform-origin: 50% 10%; }

/* accessories: hidden unless worn */
.mascot .acc { display: none; }
.mascot .acc.is-worn { display: inline; }
/* orbit around (100 96); each item turns back so it stays upright */
.mascot .acc-orbit { transform-box: view-box; transform-origin: 100px 96px; }
.mascot .acc-orbit-item { transform-box: fill-box; transform-origin: 50% 50%; }
.mascot .acc-bunny,
.mascot .acc-bunny-ear { transform-box: fill-box; transform-origin: 50% 100%; }

@media (prefers-reduced-motion: no-preference) {
  .mascot .acc-rainbow { animation: mascot-shimmer 7s ease-in-out infinite; }
  .mascot .acc-orbit { animation: mascot-orbit 40s linear infinite; }
  .mascot .acc-orbit-item { animation: mascot-orbit 40s linear infinite reverse; }
  .mascot .acc-bunny-ear-l { animation: mascot-ear-twitch 5.3s ease-in-out infinite; }
  .mascot .acc-bunny-ear-r { animation: mascot-ear-twitch 7.1s ease-in-out 1.7s infinite reverse; }
  .mascot.is-happy .acc-bunny { animation: mascot-hop 600ms ease-out; }
  .mascot { animation: mascot-bob 3.2s ease-in-out infinite; transform-origin: 50% 100%; }
  .mascot .mascot-tail { animation: mascot-tail 3.2s ease-in-out infinite; }
  .mascot.is-blinking .mascot-eyes { animation: mascot-blink 160ms ease-in-out; }

  .mascot.is-happy { animation: mascot-jump 600ms cubic-bezier(.3,.7,.4,1); }
  .mascot.is-happy .mascot-hoof-left  { animation: mascot-clap-left 600ms ease-in-out; }
  .mascot.is-happy .mascot-hoof-right { animation: mascot-clap-right 600ms ease-in-out; }

  .mascot.is-encourage .mascot-head { animation: mascot-nod 500ms ease-in-out; }
}

@keyframes mascot-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes mascot-tail {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(6deg); }
}
@keyframes mascot-blink {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.1); }
}
@keyframes mascot-jump {
  0%   { transform: translateY(0) scale(1, 1); }
  15%  { transform: translateY(2px) scale(1.06, 0.92); }
  45%  { transform: translateY(-22%) scale(0.97, 1.04); }
  75%  { transform: translateY(0) scale(1.04, 0.95); }
  100% { transform: translateY(0) scale(1, 1); }
}
@keyframes mascot-clap-left {
  0%, 100% { transform: rotate(0deg); }
  25%, 65% { transform: rotate(-42deg); }
  45%, 85% { transform: rotate(-22deg); }
}
@keyframes mascot-clap-right {
  0%, 100% { transform: rotate(0deg); }
  25%, 65% { transform: rotate(42deg); }
  45%, 85% { transform: rotate(22deg); }
}
@keyframes mascot-shimmer {
  0%, 100% { filter: none; opacity: 1; }
  50% { filter: brightness(1.06) saturate(1.1); opacity: .92; }
}
@keyframes mascot-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes mascot-ear-twitch {
  0%, 88%, 100% { transform: rotate(0deg); }
  91% { transform: rotate(-14deg); }
  94% { transform: rotate(8deg); }
  97% { transform: rotate(-4deg); }
}
@keyframes mascot-hop {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  20% { transform: translateY(0) scale(1.08, .9); }
  50% { transform: translateY(-14px) scale(.96, 1.05); }
  80% { transform: translateY(0) scale(1.06, .94); }
}
@keyframes mascot-nod {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  30% { transform: rotate(-4deg) translateY(4px); }
  60% { transform: rotate(3deg) translateY(1px); }
}

@media (prefers-reduced-motion: reduce) {
  .mascot, .mascot * { animation: none !important; transition: none !important; }
}
`;

function injectCSS(id, css) {
  if (typeof document === 'undefined' || !css || document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

const REACTION_MS = { happy: 600, encourage: 500 };

let mascotUid = 0;

export function mountMascot(container, { wear = [], avatar, palette } = {}) {
  injectCSS('mascot-css', mascotCSS);
  // unique gradient ids per instance: two mascots on one page (or one in a
  // hidden container) must never borrow each other's gradients
  const uid = ++mascotUid;
  container.insertAdjacentHTML('beforeend', mascotSVG({ avatar: avatar ?? PALETTE_AVATAR[palette], uid }));
  const el = container.lastElementChild;
  let worn = [];
  let reactTimer = null;
  let blinkTimer = null;

  function react(kind) {
    clearTimeout(reactTimer);
    el.classList.remove('is-happy', 'is-encourage');
    if (kind !== 'happy' && kind !== 'encourage') return;
    void el.getBoundingClientRect(); // force reflow so the animation restarts
    el.classList.add(`is-${kind}`);
    reactTimer = setTimeout(() => el.classList.remove(`is-${kind}`), REACTION_MS[kind] + 50);
  }

  function scheduleBlink() {
    blinkTimer = setTimeout(() => {
      if (!el.isConnected) return; // stop when removed from the page
      el.classList.add('is-blinking');
      setTimeout(() => el.classList.remove('is-blinking'), 180);
      scheduleBlink();
    }, 3000 + Math.random() * 3000);
  }
  scheduleBlink();

  function setWorn(ids = []) {
    worn = [...ids];
    const on = new Set(ids);
    for (const id of MASCOT_ACCESSORIES) {
      el.querySelector(`.acc-${id}`)?.classList.toggle('is-worn', on.has(id));
    }
  }

  function setAvatar(id) {
    const a = findAvatar(id);
    injectCSS(`mascot-css-${a.id}`, a.css);
    if (!el.classList.contains(`avatar-${a.id}`)) {
      clearTimeout(reactTimer);
      el.setAttribute('class', `mascot avatar-${a.id}`);
      el.setAttribute('aria-label', capital(a.noun));
      el.innerHTML = mascotInner(a, uid);
    }
    setWorn(worn);
  }

  worn = wear;
  setAvatar(el.getAttribute('class').match(/avatar-(\S+)/)[1]);

  return {
    el,
    react,
    wear: setWorn,
    avatar: setAvatar,
    destroy() { clearTimeout(reactTimer); clearTimeout(blinkTimer); el.remove(); },
  };
}
