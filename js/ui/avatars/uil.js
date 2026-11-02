// Avatar: uil (a little caramel owl). Follows CONTRACT.md; style matches eenhoorn.js.

const O = '#c0926a'; // outline

const defs = `
    <linearGradient id="{uid}-feathers" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6dcb8"/>
      <stop offset="1" stop-color="#ecc597"/>
    </linearGradient>
    <linearGradient id="{uid}-wing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9bf8e"/>
      <stop offset="1" stop-color="#ddaa76"/>
    </linearGradient>`;

const markup = `
  <g class="mascot-body">
    <!-- tail feathers peeking out bottom right -->
    <g class="mascot-tail">
      <path d="M130 168 Q150 164 160 176 Q154 178 151 177 Q156 186 150 190 Q145 185 143 183 Q142 190 135 190 Z" fill="url(#{uid}-wing)" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
    <!-- torso -->
    <ellipse cx="100" cy="160" rx="40" ry="28" fill="url(#{uid}-feathers)" stroke="${O}" stroke-width="3"/>
    <!-- belly with little feather marks -->
    <ellipse cx="100" cy="164" rx="25" ry="21" fill="#fff1dc"/>
    <path d="M89 156 q3 3.5 6 0 M105 156 q3 3.5 6 0 M97 165 q3 3.5 6 0 M86 168 q3 3.5 6 0 M108 168 q3 3.5 6 0 M97 176 q3 3.5 6 0" fill="none" stroke="#e2bb8e" stroke-width="2" stroke-linecap="round"/>
    <!-- feet -->
    <path d="M82 190 q-1 -7 4 -8 q3 -3 6 0 q5 1 4 8 Z" fill="#ffc06a" stroke="#e39a3a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M104 190 q-1 -7 4 -8 q3 -3 6 0 q5 1 4 8 Z" fill="#ffc06a" stroke="#e39a3a" stroke-width="2" stroke-linejoin="round"/>
    <!-- wings (the "front legs" that clap) -->
    <g class="mascot-hoof-left">
      <path d="M68 136 C60 146 57 160 59 174 Q62 182 66 176 Q69 184 73 177 Q77 183 80 174 C84 160 84 146 80 136 Q74 132 68 136 Z" fill="url(#{uid}-wing)" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M66 152 Q68 162 67 170 M73 150 Q75 160 74 170" fill="none" stroke="#f3d3ab" stroke-width="2" stroke-linecap="round"/>
    </g>
    <g class="mascot-hoof-right">
      <path d="M132 136 C140 146 143 160 141 174 Q138 182 134 176 Q131 184 127 177 Q123 183 120 174 C116 160 116 146 120 136 Q126 132 132 136 Z" fill="url(#{uid}-wing)" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M134 152 Q132 162 133 170 M127 150 Q125 160 126 170" fill="none" stroke="#f3d3ab" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>

  <g class="mascot-head">
    <!-- ear tufts (behind head) -->
    <path d="M58 72 C54 58 48 44 40 32 Q48 34 53 37 Q53 30 56 24 C64 34 76 44 84 54 Z" fill="url(#{uid}-wing)" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M60 60 C58 52 58 44 58 36 C64 44 70 48 74 54 Z" fill="#f6dcb8"/>
    <path d="M142 72 C146 58 152 44 160 32 Q152 34 147 37 Q147 30 144 24 C136 34 124 44 116 54 Z" fill="url(#{uid}-wing)" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M140 60 C142 52 142 44 142 36 C136 44 130 48 126 54 Z" fill="#f6dcb8"/>

    <!-- head -->
    <ellipse cx="100" cy="92" rx="50" ry="45" fill="url(#{uid}-feathers)" stroke="${O}" stroke-width="3"/>
    <!-- forehead feathers -->
    <path d="M86 62 q4 4 8 0 M106 62 q4 4 8 0 M96 56 q4 4 8 0" fill="none" stroke="#e2bb8e" stroke-width="2" stroke-linecap="round"/>

    <!-- light facial discs around the eyes -->
    <circle cx="77" cy="96" r="22" fill="#fff4e4" stroke="#e8c59c" stroke-width="2"/>
    <circle cx="123" cy="96" r="22" fill="#fff4e4" stroke="#e8c59c" stroke-width="2"/>

    <!-- cheeks -->
    <ellipse cx="62" cy="113" rx="8" ry="5.5" fill="#ffb3d1" opacity="0.7"/>
    <ellipse cx="138" cy="113" rx="8" ry="5.5" fill="#ffb3d1" opacity="0.7"/>

    <!-- eyes -->
    <g class="mascot-eyes">
      <ellipse cx="78" cy="95" rx="10.5" ry="12.5" fill="#4a3266"/>
      <ellipse cx="122" cy="95" rx="10.5" ry="12.5" fill="#4a3266"/>
      <circle cx="81.5" cy="90" r="4" fill="#ffffff"/>
      <circle cx="125.5" cy="90" r="4" fill="#ffffff"/>
      <circle cx="75" cy="100" r="2" fill="#ffffff" opacity="0.85"/>
      <circle cx="119" cy="100" r="2" fill="#ffffff" opacity="0.85"/>
    </g>

    <!-- beak and smile -->
    <path d="M93 108 Q100 104 107 108 Q105 116 100 120 Q95 116 93 108 Z" fill="#ffc06a" stroke="#e39a3a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M94 125 Q100 129 106 125" fill="none" stroke="#a0673f" stroke-width="2.5" stroke-linecap="round"/>
  </g>`;

export default {
  id: 'uil',
  noun: 'uil',
  article: 'de',
  markup,
  defs,
  crown: { x: 100, y: 56, scale: 0.85 }, // between the ear tufts
  css: '',
};
