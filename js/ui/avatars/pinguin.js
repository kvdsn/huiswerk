// Avatar: pinguin (a soft navy-lavender penguin). Follows CONTRACT.md; style matches eenhoorn.js.

const O = '#7479bd'; // outline

const defs = `
    <linearGradient id="{uid}-back" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#aeb3e6"/>
      <stop offset="1" stop-color="#9aa0da"/>
    </linearGradient>
    <linearGradient id="{uid}-belly" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f1f0fc"/>
    </linearGradient>`;

const markup = `
  <g class="mascot-body">
    <!-- little tail -->
    <g class="mascot-tail">
      <path d="M134 176 Q148 178 156 188 Q144 192 132 186 Z" fill="url(#{uid}-back)" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
    <!-- torso -->
    <ellipse cx="100" cy="160" rx="40" ry="28" fill="url(#{uid}-back)" stroke="${O}" stroke-width="3"/>
    <!-- white belly -->
    <ellipse cx="100" cy="163" rx="28" ry="23" fill="url(#{uid}-belly)" stroke="#d6d7f1" stroke-width="2"/>
    <!-- orange feet -->
    <ellipse cx="86" cy="188" rx="11" ry="5.5" fill="#ffbd66" stroke="#e8923f" stroke-width="2.2"/>
    <ellipse cx="114" cy="188" rx="11" ry="5.5" fill="#ffbd66" stroke="#e8923f" stroke-width="2.2"/>
    <path d="M82 185 v4 M90 185 v4 M110 185 v4 M118 185 v4" stroke="#e8923f" stroke-width="1.8" stroke-linecap="round"/>
    <!-- flippers (the "front legs" that clap) -->
    <g class="mascot-hoof-left">
      <path d="M66 138 C58 150 55 166 58 180 Q61 186 66 182 C74 170 80 154 80 140 Q73 133 66 138 Z" fill="url(#{uid}-back)" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    </g>
    <g class="mascot-hoof-right">
      <path d="M134 138 C142 150 145 166 142 180 Q139 186 134 182 C126 170 120 154 120 140 Q127 133 134 138 Z" fill="url(#{uid}-back)" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    </g>
  </g>

  <g class="mascot-head">
    <!-- head -->
    <ellipse cx="100" cy="92" rx="50" ry="45" fill="url(#{uid}-back)" stroke="${O}" stroke-width="3"/>
    <!-- hair tuft -->
    <path d="M94 50 C92 40 98 33 106 35 C101 38 100 42 103 48" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- white face (heart shaped) -->
    <path d="M100 76 C92 62 62 62 57 86 C53 108 70 131 100 132 C130 131 147 108 143 86 C138 62 108 62 100 76 Z" fill="url(#{uid}-belly)" stroke="#d6d7f1" stroke-width="2" stroke-linejoin="round"/>

    {crown}

    <!-- cheeks -->
    <ellipse cx="66" cy="110" rx="9" ry="6" fill="#ffb3d1" opacity="0.7"/>
    <ellipse cx="134" cy="110" rx="9" ry="6" fill="#ffb3d1" opacity="0.7"/>

    <!-- eyes -->
    <g class="mascot-eyes">
      <ellipse cx="78" cy="93" rx="10" ry="12.5" fill="#4a3266"/>
      <ellipse cx="122" cy="93" rx="10" ry="12.5" fill="#4a3266"/>
      <circle cx="81.5" cy="88" r="4" fill="#ffffff"/>
      <circle cx="125.5" cy="88" r="4" fill="#ffffff"/>
      <circle cx="75" cy="98" r="2" fill="#ffffff" opacity="0.85"/>
      <circle cx="119" cy="98" r="2" fill="#ffffff" opacity="0.85"/>
    </g>

    <!-- beak and smile -->
    <path d="M90 108 Q100 102 110 108 Q106 116 100 118 Q94 116 90 108 Z" fill="#ffbd66" stroke="#e8923f" stroke-width="2" stroke-linejoin="round"/>
    <path d="M93 123 Q100 128 107 123" fill="none" stroke="#7a5aa0" stroke-width="2.5" stroke-linecap="round"/>
  </g>`;

export default {
  id: 'pinguin',
  noun: 'pinguïn',
  article: 'de',
  markup,
  defs,
  crown: { x: 100, y: 55, scale: 0.9 }, // over the hair tuft, on top of the round head
  css: '',
};
