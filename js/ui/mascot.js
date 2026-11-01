// Mascot: a small friendly unicorn that reacts to answers.
// No dependencies. Usage:
//   import { mountMascot } from './ui/mascot.js';
//   const m = mountMascot(document.querySelector('#mascot'));
//   m.react('happy');      // jump + hoof clap (~600 ms)
//   m.react('encourage');  // gentle nod (~500 ms)

export const mascotSVG = `
<svg class="mascot" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Eenhoorn">
  <defs>
    <linearGradient id="mascot-horn-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff3b0"/>
      <stop offset="1" stop-color="#f7c95c"/>
    </linearGradient>
    <linearGradient id="mascot-skin-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#fbeef7"/>
    </linearGradient>
  </defs>

  <g class="mascot-body">
    <!-- tail -->
    <g class="mascot-tail">
      <path d="M136 162 C160 158 170 140 162 126 C176 134 180 156 166 170 C156 180 140 176 136 162 Z" fill="#c8a8f0" stroke="#b48ad6" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M138 164 C156 164 166 152 166 140 C172 152 168 166 156 172 C148 175 141 171 138 164 Z" fill="#a8e6cf"/>
    </g>
    <!-- torso -->
    <ellipse cx="100" cy="160" rx="40" ry="28" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3"/>
    <!-- belly sparkle -->
    <path d="M100 160 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 Z" fill="#ffd1e8"/>
    <!-- front legs -->
    <g class="mascot-hoof-left">
      <rect x="72" y="158" width="20" height="34" rx="10" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3"/>
      <path d="M72.5 182 h19 v2 a8.5 8.5 0 0 1 -8.5 8.5 h-2 a8.5 8.5 0 0 1 -8.5 -8.5 Z" fill="#d9b8f2"/>
    </g>
    <g class="mascot-hoof-right">
      <rect x="108" y="158" width="20" height="34" rx="10" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3"/>
      <path d="M108.5 182 h19 v2 a8.5 8.5 0 0 1 -8.5 8.5 h-2 a8.5 8.5 0 0 1 -8.5 -8.5 Z" fill="#d9b8f2"/>
    </g>
  </g>

  <g class="mascot-head">
    <!-- back mane (behind head) -->
    <g class="mascot-mane">
      <path d="M58 60 C34 74 30 110 44 134 C36 112 46 92 60 84 Z" fill="#ffb3d9" stroke="#e48fbf" stroke-width="2" stroke-linejoin="round"/>
      <path d="M62 70 C46 88 46 118 60 138 C56 116 62 100 72 92 Z" fill="#c8a8f0" stroke="#b48ad6" stroke-width="2" stroke-linejoin="round"/>
      <path d="M146 64 C168 80 170 112 156 134 C162 112 154 96 140 88 Z" fill="#fff0a8" stroke="#e8cf6a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M142 60 C164 72 170 100 160 124 C160 104 152 90 140 84 Z" fill="#a8e6cf" stroke="#7fcfae" stroke-width="2" stroke-linejoin="round"/>
    </g>

    <!-- ears -->
    <path d="M58 64 L56 30 L84 50 Z" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3" stroke-linejoin="round"/>
    <path d="M61 56 L60 38 L76 50 Z" fill="#ffc6e2"/>
    <path d="M142 64 L144 30 L116 50 Z" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3" stroke-linejoin="round"/>
    <path d="M139 56 L140 38 L124 50 Z" fill="#ffc6e2"/>

    <!-- head -->
    <ellipse cx="100" cy="92" rx="50" ry="45" fill="url(#mascot-skin-grad)" stroke="#c79bd8" stroke-width="3"/>

    <!-- horn -->
    <g class="mascot-horn">
      <path d="M90 52 L100 8 L110 52 Q100 57 90 52 Z" fill="url(#mascot-horn-grad)" stroke="#e0a83a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M92.5 42 Q100 40 107.5 36 M94.5 32 Q100 30 105 26 M96.5 22 Q100 21 103 17" fill="none" stroke="#e0a83a" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- front mane / forelock (rainbow curls) -->
    <g class="mascot-mane">
      <path d="M86 52 C70 46 54 54 50 70 C48 80 52 90 58 96 C58 84 64 74 76 70 C80 76 88 78 94 74 C90 68 88 60 86 52 Z" fill="#ffb3d9" stroke="#e48fbf" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M70 56 C62 60 58 68 58 78 C62 72 68 68 74 67 Z" fill="#fff3b0"/>
      <path d="M112 52 C126 46 142 52 148 66 C150 74 148 82 144 88 C142 78 136 70 126 68 C124 62 118 56 112 52 Z" fill="#c8a8f0" stroke="#b48ad6" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M128 56 C136 58 142 64 144 72 C138 68 132 66 126 65 Z" fill="#a8e6cf"/>
    </g>

    <!-- cheeks -->
    <ellipse cx="66" cy="110" rx="9" ry="6" fill="#ffb3d1" opacity="0.7"/>
    <ellipse cx="134" cy="110" rx="9" ry="6" fill="#ffb3d1" opacity="0.7"/>

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
    <ellipse cx="100" cy="118" rx="24" ry="14" fill="#ffe3f1"/>
    <ellipse cx="92" cy="115" rx="2.2" ry="1.6" fill="#d58bb8"/>
    <ellipse cx="108" cy="115" rx="2.2" ry="1.6" fill="#d58bb8"/>
    <path d="M93 122 Q100 128 107 122" fill="none" stroke="#a0567f" stroke-width="2.5" stroke-linecap="round"/>
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

@media (prefers-reduced-motion: no-preference) {
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

export function mountMascot(container) {
  injectCSS();
  container.insertAdjacentHTML('beforeend', mascotSVG.trim());
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

  return {
    el,
    react,
    destroy() { clearTimeout(reactTimer); clearTimeout(blinkTimer); el.remove(); },
  };
}
