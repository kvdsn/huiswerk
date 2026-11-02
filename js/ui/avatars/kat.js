// Avatar: kat (a soft peach tabby kitten). See CONTRACT.md in this folder.

const defs = `
    <linearGradient id="{uid}-fur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff1e2"/>
      <stop offset="1" stop-color="#ffdcbc"/>
    </linearGradient>`;

const markup = `
  <g class="mascot-body">
    <!-- tail: a striped curl on the right -->
    <g class="mascot-tail">
      <path d="M130 172 C156 176 170 160 166 138 C164 126 156 118 148 118" fill="none" stroke="#e0a07a" stroke-width="17" stroke-linecap="round"/>
      <path d="M130 172 C156 176 170 160 166 138 C164 126 156 118 148 118" fill="none" stroke="#ffe3c8" stroke-width="11" stroke-linecap="round"/>
      <path d="M130 172 C156 176 170 160 166 138 C164 126 156 118 148 118" fill="none" stroke="#f7b98a" stroke-width="11" stroke-dasharray="5 9" stroke-dashoffset="-10"/>
    </g>
    <!-- torso -->
    <ellipse cx="100" cy="160" rx="40" ry="28" fill="url(#{uid}-fur)" stroke="#e0a07a" stroke-width="3"/>
    <!-- light chest and side stripes -->
    <ellipse cx="100" cy="158" rx="17" ry="16" fill="#fffaf4"/>
    <path d="M64 150 Q70 152 72 158 M62 162 Q68 163 71 168 M136 150 Q130 152 128 158 M138 162 Q132 163 129 168" fill="none" stroke="#f7b98a" stroke-width="3.5" stroke-linecap="round"/>
    <!-- front legs with white socks -->
    <g class="mascot-hoof-left">
      <rect x="72" y="158" width="20" height="34" rx="10" fill="url(#{uid}-fur)" stroke="#e0a07a" stroke-width="3"/>
      <path d="M72.5 180 h19 v4 a8.5 8.5 0 0 1 -8.5 8.5 h-2 a8.5 8.5 0 0 1 -8.5 -8.5 Z" fill="#fffaf4"/>
      <path d="M79 186.5 v3.5 M85 186.5 v3.5" stroke="#e0a07a" stroke-width="2" stroke-linecap="round"/>
    </g>
    <g class="mascot-hoof-right">
      <rect x="108" y="158" width="20" height="34" rx="10" fill="url(#{uid}-fur)" stroke="#e0a07a" stroke-width="3"/>
      <path d="M108.5 180 h19 v4 a8.5 8.5 0 0 1 -8.5 8.5 h-2 a8.5 8.5 0 0 1 -8.5 -8.5 Z" fill="#fffaf4"/>
      <path d="M115 186.5 v3.5 M121 186.5 v3.5" stroke="#e0a07a" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>

  <g class="mascot-head">
    <!-- pointy ears -->
    <path d="M54 78 L58 30 L94 52 Z" fill="url(#{uid}-fur)" stroke="#e0a07a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M61 66 L63 41 L82 53 Z" fill="#ffc6d3"/>
    <path d="M146 78 L142 30 L106 52 Z" fill="url(#{uid}-fur)" stroke="#e0a07a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M139 66 L137 41 L118 53 Z" fill="#ffc6d3"/>

    <!-- head -->
    <ellipse cx="100" cy="92" rx="50" ry="45" fill="url(#{uid}-fur)" stroke="#e0a07a" stroke-width="3"/>

    <!-- tabby stripes: forehead and cheeks -->
    <path d="M100 50 V62 M88 51.5 Q90.5 56 89.5 61 M112 51.5 Q109.5 56 110.5 61" fill="none" stroke="#f7b98a" stroke-width="4" stroke-linecap="round"/>
    <path d="M51.5 88 H60 M52 97 H59 M148.5 88 H140 M148 97 H141" fill="none" stroke="#f7b98a" stroke-width="3.5" stroke-linecap="round"/>

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
    </g>

    <!-- muzzle, nose, mouth, whiskers -->
    <ellipse cx="92.5" cy="118" rx="9.5" ry="7.5" fill="#fffaf4"/>
    <ellipse cx="107.5" cy="118" rx="9.5" ry="7.5" fill="#fffaf4"/>
    <path d="M95 110.5 H105 Q105 114.5 100 116.5 Q95 114.5 95 110.5 Z" fill="#ff9fb9" stroke="#ff9fb9" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M100 116.5 V119 M93.5 120 Q96.8 124 100 119.5 Q103.2 124 106.5 120" fill="none" stroke="#a8665a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M70 115 L55 112 M70 120 L56 122 M130 115 L145 112 M130 120 L144 122" fill="none" stroke="#e0a07a" stroke-width="2" stroke-linecap="round"/>
  </g>`;

export default {
  id: 'kat',
  noun: 'kat',
  article: 'de',
  markup,
  defs,
  crown: { x: 100, y: 60, scale: 0.85 },
  css: '',
};
