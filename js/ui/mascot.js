// Mascot: a small friendly unicorn that reacts to answers.
// No dependencies. Usage:
//   import { mountMascot } from './ui/mascot.js';
//   const m = mountMascot(document.querySelector('#mascot'));
//   m.react('happy');      // jump + hoof clap (~600 ms)
//   m.react('encourage');  // gentle nod (~500 ms)
//   m.wear(['regenboog', 'konijntje']); // accessories: regenboog, schelpenkroon, konijntje, planeet
//   mountMascot(el, { wear: ['planeet'] }); // start with accessories on
//   mountMascot(el, { palette: 'paars' });  // colour variant: 'roze' (default) or 'paars' ('mint' = old alias for 'paars')
//   m.palette('roze');     // switch colours live

export const MASCOT_ACCESSORIES = ['regenboog', 'schelpenkroon', 'konijntje', 'planeet'];
export const MASCOT_PALETTES = ['roze', 'paars']; // 'roze' = the original look; 'paars' = purple/lilac sister
// old names still accepted (saved data), not offered as choices
const PALETTE_ALIASES = { mint: 'paars' };

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

export const mascotSVG = `
<svg class="mascot" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Eenhoorn">
  <defs>
    <linearGradient id="mascot-horn-grad" x1="0" y1="0" x2="1" y2="1">
      <stop class="m-horn-s1" offset="0" stop-color="#fff3b0"/>
      <stop class="m-horn-s2" offset="1" stop-color="#f7c95c"/>
    </linearGradient>
    <linearGradient id="mascot-skin-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop class="m-skin-s2" offset="1" stop-color="#fbeef7"/>
    </linearGradient>
  </defs>

  <!-- accessory: rainbow (behind everything) -->
  <g class="acc acc-regenboog">
    <g class="acc-rainbow" fill="none" stroke-width="10.5">
      ${rainbowArc(116, '#ffb3d9')}${rainbowArc(106, '#ffe08a')}${rainbowArc(96, '#a8e6cf')}${rainbowArc(86, '#c8b2f5')}
    </g>
    ${cloud(-1, 176)}${cloud(201, 176)}
  </g>

  <g class="mascot-body">
    <!-- tail -->
    <g class="mascot-tail">
      <path d="M136 162 C160 158 170 140 162 126 C176 134 180 156 166 170 C156 180 140 176 136 162 Z" class="m-c2" fill="#c8a8f0" stroke="#b48ad6" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M138 164 C156 164 166 152 166 140 C172 152 168 166 156 172 C148 175 141 171 138 164 Z" class="m-c4" fill="#a8e6cf"/>
    </g>
    <!-- torso -->
    <ellipse cx="100" cy="160" rx="40" ry="28" class="m-line" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3"/>
    <!-- belly sparkle -->
    <path d="M100 160 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 Z" class="m-sparkle" fill="#ffd1e8"/>
    <!-- front legs -->
    <g class="mascot-hoof-left">
      <rect x="72" y="158" width="20" height="34" rx="10" class="m-line" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3"/>
      <path d="M72.5 182 h19 v2 a8.5 8.5 0 0 1 -8.5 8.5 h-2 a8.5 8.5 0 0 1 -8.5 -8.5 Z" class="m-hoof" fill="#d9b8f2"/>
    </g>
    <g class="mascot-hoof-right">
      <rect x="108" y="158" width="20" height="34" rx="10" class="m-line" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3"/>
      <path d="M108.5 182 h19 v2 a8.5 8.5 0 0 1 -8.5 8.5 h-2 a8.5 8.5 0 0 1 -8.5 -8.5 Z" class="m-hoof" fill="#d9b8f2"/>
    </g>
  </g>

  <g class="mascot-head">
    <!-- back mane (behind head) -->
    <g class="mascot-mane">
      <path d="M58 60 C34 74 30 110 44 134 C36 112 46 92 60 84 Z" class="m-c1" fill="#ffb3d9" stroke="#e48fbf" stroke-width="2" stroke-linejoin="round"/>
      <path d="M62 70 C46 88 46 118 60 138 C56 116 62 100 72 92 Z" class="m-c2" fill="#c8a8f0" stroke="#b48ad6" stroke-width="2" stroke-linejoin="round"/>
      <path d="M146 64 C168 80 170 112 156 134 C162 112 154 96 140 88 Z" fill="#fff0a8" stroke="#e8cf6a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M142 60 C164 72 170 100 160 124 C160 104 152 90 140 84 Z" class="m-c4" fill="#a8e6cf" stroke="#7fcfae" stroke-width="2" stroke-linejoin="round"/>
    </g>

    <!-- ears -->
    <path d="M58 64 L56 30 L84 50 Z" class="m-line" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3" stroke-linejoin="round"/>
    <path d="M61 56 L60 38 L76 50 Z" class="m-ear" fill="#ffc6e2"/>
    <path d="M142 64 L144 30 L116 50 Z" class="m-line" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3" stroke-linejoin="round"/>
    <path d="M139 56 L140 38 L124 50 Z" class="m-ear" fill="#ffc6e2"/>

    <!-- head -->
    <ellipse cx="100" cy="92" rx="50" ry="45" class="m-line" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3"/>

    <!-- horn -->
    <g class="mascot-horn">
      <path d="M90 52 L100 8 L110 52 Q100 57 90 52 Z" class="m-horn" fill="url(#mascot-horn-grad)" stroke="#e0a83a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M92.5 42 Q100 40 107.5 36 M94.5 32 Q100 30 105 26 M96.5 22 Q100 21 103 17" class="m-horn" fill="none" stroke="#e0a83a" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- front mane / forelock (rainbow curls) -->
    <g class="mascot-mane">
      <path d="M86 52 C70 46 54 54 50 70 C48 80 52 90 58 96 C58 84 64 74 76 70 C80 76 88 78 94 74 C90 68 88 60 86 52 Z" class="m-c1" fill="#ffb3d9" stroke="#e48fbf" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M70 56 C62 60 58 68 58 78 C62 72 68 68 74 67 Z" fill="#fff3b0"/>
      <path d="M112 52 C126 46 142 52 148 66 C150 74 148 82 144 88 C142 78 136 70 126 68 C124 62 118 56 112 52 Z" class="m-c2" fill="#c8a8f0" stroke="#b48ad6" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M128 56 C136 58 142 64 144 72 C138 68 132 66 126 65 Z" class="m-c4" fill="#a8e6cf"/>
    </g>

    <!-- accessory: crown of shells and pearls around the base of the horn (the horn stays free) -->
    <g class="acc acc-schelpenkroon">
      <path d="M72 50Q86 46 92 50L91 59Q84 56 73 59ZM108 50Q114 46 128 50L127 59Q116 56 109 59Z" fill="#a8e6cf" stroke="#7fcfae" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M88 52Q100 57 112 52L111 60Q100 64 89 60Z" fill="#a8e6cf" stroke="#7fcfae" stroke-width="2.2" stroke-linejoin="round"/>
      ${shell(73, 52, -32, 0.85, '#d9c6fa', '#b48ad6')}${shell(127, 52, 32, 0.85, '#d9c6fa', '#b48ad6')}
      ${shell(85, 50, -10, 1.1, '#ffc0dc', '#e48fbf')}${shell(115, 50, 10, 1.1, '#ffc0dc', '#e48fbf')}
      ${pearl(79, 56, 2.6)}${pearl(92, 56.5, 2.8)}${pearl(100, 59, 3.4)}${pearl(108, 56.5, 2.8)}${pearl(121, 56, 2.6)}
    </g>

    <!-- cheeks -->
    <ellipse cx="66" cy="110" rx="9" ry="6" class="m-cheek" fill="#ffb3d1" opacity="0.7"/>
    <ellipse cx="134" cy="110" rx="9" ry="6" class="m-cheek" fill="#ffb3d1" opacity="0.7"/>

    <!-- eyes -->
    <g class="mascot-eyes">
      <ellipse cx="78" cy="94" rx="10" ry="12.5" fill="#4a3266"/>
      <ellipse cx="122" cy="94" rx="10" ry="12.5" fill="#4a3266"/>
      <circle cx="81.5" cy="89" r="4" fill="#ffffff"/>
      <circle cx="125.5" cy="89" r="4" fill="#ffffff"/>
      <circle cx="75" cy="99" r="2" fill="#ffffff" opacity="0.85"/>
      <circle cx="119" cy="99" r="2" fill="#ffffff" opacity="0.85"/>
      <path d="M68 86 L63 82 M70 82 L66 77" stroke="#4a3266" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M132 86 L137 82 M130 82 L134 77" stroke="#4a3266" stroke-width="2.2" stroke-linecap="round"/>
    </g>

    <!-- muzzle -->
    <ellipse cx="100" cy="118" rx="24" ry="14" class="m-muzzle" fill="#ffe3f1"/>
    <ellipse cx="92" cy="115" rx="2.2" ry="1.6" class="m-nostril" fill="#d58bb8"/>
    <ellipse cx="108" cy="115" rx="2.2" ry="1.6" class="m-nostril" fill="#d58bb8"/>
    <path d="M93 122 Q100 128 107 122" fill="none" class="m-mouth" stroke="#a0567f" stroke-width="2.5" stroke-linecap="round"/>

  </g>

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
</svg>`;

export const mascotCSS = `
.mascot { display: block; width: 100%; height: auto; overflow: visible; }
.mascot .mascot-body,
.mascot .mascot-head,
.mascot .mascot-eyes,
.mascot .mascot-horn,
.mascot .mascot-mane,
.mascot .mascot-tail,
.mascot .mascot-hoof-left,
.mascot .mascot-hoof-right { transform-box: fill-box; }
.mascot .mascot-head { transform-origin: 50% 92%; }
.mascot .mascot-eyes { transform-origin: 50% 50%; }
.mascot .mascot-horn { transform-origin: 50% 100%; }
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

/* palette "paars": the purple/lilac sister unicorn. "roze" is the markup's own
   colours. CSS fill/stroke beat the presentation attributes; the gradients get
   per-instance ids in mountMascot so their stops can be recoloured too. */
.mascot.palette-paars .m-line { stroke: #b49ad9; }
.mascot.palette-paars .m-skin-s2 { stop-color: #f4effd; }
.mascot.palette-paars .m-c1 { fill: #b38cf0; stroke: #8d62d4; }
.mascot.palette-paars .m-c2 { fill: #d2bcfa; stroke: #a283de; }
.mascot.palette-paars .m-c4 { fill: #f2c6ee; stroke: #cf96d3; }
.mascot.palette-paars .m-sparkle { fill: #e0cffb; }
.mascot.palette-paars .m-hoof { fill: #cdb6f4; }
.mascot.palette-paars .m-ear { fill: #ddcbfa; }
.mascot.palette-paars .m-cheek { fill: #e8a6dc; }
.mascot.palette-paars .m-muzzle { fill: #f1e8fd; }
.mascot.palette-paars .m-nostril { fill: #b28ed2; }
.mascot.palette-paars .m-mouth { stroke: #7d52a3; }
.mascot.palette-paars .m-horn { stroke: #9c88cf; }
.mascot.palette-paars .m-horn-s1 { stop-color: #ffffff; }
.mascot.palette-paars .m-horn-s2 { stop-color: #cdbdf2; }

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
  .mascot.is-happy .mascot-horn { animation: mascot-horn-glow 600ms ease-out; }

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
@keyframes mascot-horn-glow {
  0%, 100% { filter: none; }
  40% { filter: drop-shadow(0 0 6px #fff3b0) brightness(1.15); }
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

function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById('mascot-css')) return;
  const style = document.createElement('style');
  style.id = 'mascot-css';
  style.textContent = mascotCSS;
  document.head.appendChild(style);
}

const REACTION_MS = { happy: 600, encourage: 500 };

let mascotUid = 0;

export function mountMascot(container, { wear = [], palette = 'roze' } = {}) {
  injectCSS();
  // unique gradient ids per instance: two mascots on one page (or one in a
  // hidden container) must never borrow each other's gradients
  const uid = ++mascotUid;
  container.insertAdjacentHTML('beforeend', mascotSVG.trim().replace(/mascot-(horn|skin)-grad/g, `$&-${uid}`));
  const el = container.lastElementChild;
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
    const on = new Set(ids);
    for (const id of MASCOT_ACCESSORIES) {
      el.querySelector(`.acc-${id}`)?.classList.toggle('is-worn', on.has(id));
    }
  }
  setWorn(wear);

  function setPalette(name) {
    const n = PALETTE_ALIASES[name] ?? name;
    const p = MASCOT_PALETTES.includes(n) ? n : 'roze';
    for (const id of MASCOT_PALETTES) el.classList.toggle(`palette-${id}`, id === p);
  }
  setPalette(palette);

  return {
    el,
    react,
    wear: setWorn,
    palette: setPalette,
    destroy() { clearTimeout(reactTimer); clearTimeout(blinkTimer); el.remove(); },
  };
}
