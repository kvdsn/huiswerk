// Avatar: vos (a warm orange fox with a white chest and tail tip). See CONTRACT.md in this folder.

const defs = `
    <linearGradient id="{uid}-fur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffcf9f"/>
      <stop offset="1" stop-color="#ffba80"/>
    </linearGradient>`;

const markup = `
  <g class="mascot-body">
    <!-- big bushy tail with a white tip -->
    <g class="mascot-tail">
      <path d="M132 174 C158 180 174 160 170 134 C168 118 160 106 150 102 C154 118 150 138 134 152 Z" fill="url(#{uid}-fur)"/>
      <path d="M170 134 C168 118 160 106 150 102 C152 114 151 128 146 140 C155 145 166 143 170 134 Z" fill="#fffaf3"/>
      <path d="M132 174 C158 180 174 160 170 134 C168 118 160 106 150 102 C154 118 150 138 134 152" fill="none" stroke="#e08d58" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    </g>
    <!-- torso -->
    <ellipse cx="100" cy="160" rx="40" ry="28" fill="url(#{uid}-fur)" stroke="#e08d58" stroke-width="3"/>
    <!-- white fluffy chest -->
    <path d="M80 138 Q100 132 120 138 Q124 156 112 168 L106 164 L100 171 L94 164 L88 168 Q76 156 80 138 Z" fill="#fffaf3" stroke-linejoin="round"/>
    <!-- front legs with brown socks -->
    <g class="mascot-hoof-left">
      <rect x="72" y="158" width="20" height="34" rx="10" fill="url(#{uid}-fur)" stroke="#e08d58" stroke-width="3"/>
      <path d="M72.5 177 h19 v7 a8.5 8.5 0 0 1 -8.5 8.5 h-2 a8.5 8.5 0 0 1 -8.5 -8.5 Z" fill="#b97c63"/>
    </g>
    <g class="mascot-hoof-right">
      <rect x="108" y="158" width="20" height="34" rx="10" fill="url(#{uid}-fur)" stroke="#e08d58" stroke-width="3"/>
      <path d="M108.5 177 h19 v7 a8.5 8.5 0 0 1 -8.5 8.5 h-2 a8.5 8.5 0 0 1 -8.5 -8.5 Z" fill="#b97c63"/>
    </g>
  </g>

  <g class="mascot-head">
    <!-- tall pointy ears with brown tips -->
    <path d="M52 82 L56 20 L94 50 Z" fill="url(#{uid}-fur)"/>
    <path d="M60 68 L61 35 L82 52 Z" fill="#fff1e2"/>
    <path d="M56 20 L54.6 38 Q61 32 67.5 29 Z" fill="#b97c63"/>
    <path d="M52 82 L56 20 L94 50 Z" fill="none" stroke="#e08d58" stroke-width="3" stroke-linejoin="round"/>
    <path d="M148 82 L144 20 L106 50 Z" fill="url(#{uid}-fur)"/>
    <path d="M140 68 L139 35 L118 52 Z" fill="#fff1e2"/>
    <path d="M144 20 L145.4 38 Q139 32 132.5 29 Z" fill="#b97c63"/>
    <path d="M148 82 L144 20 L106 50 Z" fill="none" stroke="#e08d58" stroke-width="3" stroke-linejoin="round"/>

    <!-- fluffy cheek tufts -->
    <path d="M56 101 Q44 103 40 111 Q46 113 49 115 Q43 120 43 126 Q54 128 63 122 Z" fill="#fffaf3" stroke="#e08d58" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M144 101 Q156 103 160 111 Q154 113 151 115 Q157 120 157 126 Q146 128 137 122 Z" fill="#fffaf3" stroke="#e08d58" stroke-width="2.5" stroke-linejoin="round"/>

    <!-- head -->
    <ellipse cx="100" cy="92" rx="50" ry="45" fill="url(#{uid}-fur)"/>
    <!-- white lower face -->
    <path d="M51 99 Q70 97 86 108 Q100 101 114 108 Q130 97 149 99 Q147 123 126 133 Q100 141 74 133 Q53 123 51 99 Z" fill="#fffaf3"/>
    <ellipse cx="100" cy="92" rx="50" ry="45" fill="none" stroke="#e08d58" stroke-width="3"/>

    <!-- cheeks -->
    <ellipse cx="66" cy="112" rx="9" ry="6" fill="#ffb3d1" opacity="0.7"/>
    <ellipse cx="134" cy="112" rx="9" ry="6" fill="#ffb3d1" opacity="0.7"/>

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

    <!-- nose and mouth -->
    <path d="M94.5 111 H105.5 Q105.5 115.5 100 117.5 Q94.5 115.5 94.5 111 Z" fill="#6e4a5c" stroke="#6e4a5c" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="98" cy="112.5" r="1.3" fill="#ffffff" opacity="0.7"/>
    <path d="M100 117.5 V120 M93.5 121 Q96.8 125 100 120.5 Q103.2 125 106.5 121" fill="none" stroke="#9a5a4e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;

export default {
  id: 'vos',
  noun: 'vos',
  article: 'de',
  markup,
  defs,
  crown: { x: 100, y: 60, scale: 0.85 },
  css: '',
};
