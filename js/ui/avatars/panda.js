// Avatar: panda (white with soft deep purple-grey patches). See CONTRACT.md in this folder.

const defs = `
    <linearGradient id="{uid}-fur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f2eef7"/>
    </linearGradient>`;

const markup = `
  <g class="mascot-body">
    <!-- torso -->
    <ellipse cx="100" cy="160" rx="40" ry="28" fill="url(#{uid}-fur)" stroke="#8c7ca3" stroke-width="3"/>
    <!-- little heart on the tummy -->
    <path d="M100 170 C92 164 91 157 95.5 155.5 C98 154.8 99.5 156.5 100 158 C100.5 156.5 102 154.8 104.5 155.5 C109 157 108 164 100 170 Z" fill="#ffd1e3"/>
    <!-- hind feet -->
    <ellipse cx="64" cy="183" rx="15" ry="9" fill="#5f5173" stroke="#8c7ca3" stroke-width="3"/>
    <ellipse cx="136" cy="183" rx="15" ry="9" fill="#5f5173" stroke="#8c7ca3" stroke-width="3"/>
    <ellipse cx="60" cy="183" rx="5" ry="4" fill="#f5b8d0"/>
    <ellipse cx="140" cy="183" rx="5" ry="4" fill="#f5b8d0"/>
    <!-- front legs (dark) with pink pads -->
    <g class="mascot-hoof-left">
      <rect x="72" y="158" width="20" height="34" rx="10" fill="#5f5173" stroke="#8c7ca3" stroke-width="3"/>
      <ellipse cx="82" cy="185" rx="5" ry="3.5" fill="#f5b8d0"/>
    </g>
    <g class="mascot-hoof-right">
      <rect x="108" y="158" width="20" height="34" rx="10" fill="#5f5173" stroke="#8c7ca3" stroke-width="3"/>
      <ellipse cx="118" cy="185" rx="5" ry="3.5" fill="#f5b8d0"/>
    </g>
  </g>

  <g class="mascot-head">
    <!-- round ears -->
    <circle cx="61" cy="56" r="17" fill="#5f5173" stroke="#8c7ca3" stroke-width="3"/>
    <circle cx="62" cy="57" r="8" fill="#e6a9c6"/>
    <circle cx="139" cy="56" r="17" fill="#5f5173" stroke="#8c7ca3" stroke-width="3"/>
    <circle cx="138" cy="57" r="8" fill="#e6a9c6"/>

    <!-- head -->
    <ellipse cx="100" cy="92" rx="50" ry="45" fill="url(#{uid}-fur)" stroke="#8c7ca3" stroke-width="3"/>

    <!-- eye patches -->
    <ellipse cx="76" cy="97" rx="16" ry="20" transform="rotate(32 76 97)" fill="#6c5d82"/>
    <ellipse cx="124" cy="97" rx="16" ry="20" transform="rotate(-32 124 97)" fill="#6c5d82"/>

    <!-- cheeks -->
    <ellipse cx="64" cy="114" rx="9" ry="6" fill="#ffb3d1" opacity="0.75"/>
    <ellipse cx="136" cy="114" rx="9" ry="6" fill="#ffb3d1" opacity="0.75"/>

    <!-- eyes: a light ring keeps them readable on the dark patches -->
    <g class="mascot-eyes">
      <ellipse cx="78" cy="94" rx="10" ry="12.5" fill="#33253f" stroke="#f3eef8" stroke-width="2"/>
      <ellipse cx="122" cy="94" rx="10" ry="12.5" fill="#33253f" stroke="#f3eef8" stroke-width="2"/>
      <circle cx="81.5" cy="89" r="4" fill="#ffffff"/>
      <circle cx="125.5" cy="89" r="4" fill="#ffffff"/>
      <circle cx="75" cy="99" r="2" fill="#ffffff" opacity="0.85"/>
      <circle cx="119" cy="99" r="2" fill="#ffffff" opacity="0.85"/>
    </g>

    <!-- nose and mouth -->
    <ellipse cx="100" cy="114" rx="7" ry="4.8" fill="#5f5173"/>
    <ellipse cx="98" cy="112.6" rx="2.2" ry="1.2" fill="#a597b8"/>
    <path d="M100 118.5 V120.5 M93.5 121 Q96.8 125 100 120.5 Q103.2 125 106.5 121" fill="none" stroke="#5f5173" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;

export default {
  id: 'panda',
  noun: 'panda',
  article: 'de',
  markup,
  defs,
  crown: { x: 100, y: 60, scale: 0.85 },
  css: '',
};
