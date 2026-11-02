// Avatar: draakje (a friendly mint baby dragon). Follows CONTRACT.md; style matches eenhoorn.js.

const O = '#6fc29b'; // outline

const defs = `
    <linearGradient id="{uid}-skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9f7e4"/>
      <stop offset="1" stop-color="#bdeccf"/>
    </linearGradient>
    <linearGradient id="{uid}-horn" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff6c8"/>
      <stop offset="1" stop-color="#f7d77a"/>
    </linearGradient>`;

const markup = `
  <g class="mascot-body">
    <!-- small wings behind the shoulders -->
    <path d="M72 144 C60 128 46 122 36 128 C41 133 42 138 40 144 C46 144 50 148 50 154 C57 152 63 153 68 158 Z" fill="#ffd6c4" stroke="#eea98c" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M128 144 C140 128 154 122 164 128 C159 133 158 138 160 144 C154 144 150 148 150 154 C143 152 137 153 132 158 Z" fill="#ffd6c4" stroke="#eea98c" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- tail curling up on the right, with a soft spade tip -->
    <g class="mascot-tail">
      <path d="M134 168 C150 172 160 166 161 154 C161 148 167 147 168 153 C170 170 156 184 136 182 Z" fill="url(#{uid}-skin)" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M164 151 C158 146 158 138 164 132 C170 138 172 146 167 151 Z" fill="#ffd6c4" stroke="#eea98c" stroke-width="2.2" stroke-linejoin="round"/>
    </g>
    <!-- torso -->
    <ellipse cx="100" cy="160" rx="40" ry="28" fill="url(#{uid}-skin)" stroke="${O}" stroke-width="3"/>
    <!-- belly scales -->
    <ellipse cx="100" cy="164" rx="24" ry="21" fill="#fff4c9" stroke="#efd88e" stroke-width="2"/>
    <path d="M80 156 Q100 162 120 156 M78 166 Q100 172 122 166 M83 176 Q100 181 117 176" fill="none" stroke="#efd88e" stroke-width="2" stroke-linecap="round"/>
    <!-- front legs -->
    <g class="mascot-hoof-left">
      <rect x="72" y="158" width="20" height="34" rx="10" fill="url(#{uid}-skin)" stroke="${O}" stroke-width="3"/>
      <path d="M78 191 v-4 M86 191 v-4" stroke="${O}" stroke-width="2" stroke-linecap="round"/>
    </g>
    <g class="mascot-hoof-right">
      <rect x="108" y="158" width="20" height="34" rx="10" fill="url(#{uid}-skin)" stroke="${O}" stroke-width="3"/>
      <path d="M114 191 v-4 M122 191 v-4" stroke="${O}" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>

  <g class="mascot-head">
    <!-- fin ears (behind head) -->
    <path d="M54 80 C42 70 32 70 28 74 C32 80 32 86 30 92 C38 94 46 98 54 102 Z" fill="url(#{uid}-skin)" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50 84 C42 78 36 77 34 78 C37 83 37 87 36 90 C41 91 46 93 50 96 Z" fill="#ffd6c4"/>
    <path d="M146 80 C158 70 168 70 172 74 C168 80 168 86 170 92 C162 94 154 98 146 102 Z" fill="url(#{uid}-skin)" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M150 84 C158 78 164 77 166 78 C163 83 163 87 164 90 C159 91 154 93 150 96 Z" fill="#ffd6c4"/>

    <!-- head -->
    <ellipse cx="100" cy="92" rx="50" ry="45" fill="url(#{uid}-skin)" stroke="${O}" stroke-width="3"/>
    <!-- a few soft spots -->
    <circle cx="70" cy="68" r="3.5" fill="#a9e3c2"/>
    <circle cx="62" cy="78" r="2.5" fill="#a9e3c2"/>
    <circle cx="130" cy="68" r="3.5" fill="#a9e3c2"/>
    <circle cx="138" cy="78" r="2.5" fill="#a9e3c2"/>

    {crown}

    <!-- tiny rounded horns -->
    <path d="M65 63 C61 55 61 46 64 39 Q66 34 70 38 C76 43 80 49 83 56 Q74 64 65 63 Z" fill="url(#{uid}-horn)" stroke="#e0b860" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M135 63 C139 55 139 46 136 39 Q134 34 130 38 C124 43 120 49 117 56 Q126 64 135 63 Z" fill="url(#{uid}-horn)" stroke="#e0b860" stroke-width="2.5" stroke-linejoin="round"/>

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

    <!-- muzzle -->
    <ellipse cx="100" cy="118" rx="24" ry="14" fill="#e9fbef"/>
    <ellipse cx="92" cy="114" rx="2.4" ry="1.7" fill="#5fae88"/>
    <ellipse cx="108" cy="114" rx="2.4" ry="1.7" fill="#5fae88"/>
    <path d="M93 121 Q100 127 107 121" fill="none" stroke="#4f9877" stroke-width="2.5" stroke-linecap="round"/>
  </g>`;

export default {
  id: 'draakje',
  noun: 'draakje',
  article: 'het',
  markup,
  defs,
  crown: { x: 100, y: 55, scale: 0.78 }, // between the horns, drawn behind them
  css: '',
};
