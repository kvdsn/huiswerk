// Avatar: konijn (a lavender bunny with long ears). See CONTRACT.md in this folder.

const defs = `
    <linearGradient id="{uid}-fur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7f2ff"/>
      <stop offset="1" stop-color="#e6dafa"/>
    </linearGradient>`;

const markup = `
  <g class="mascot-body">
    <!-- tail: a fluffy pompom peeking out on the right -->
    <g class="mascot-tail">
      <path d="M134 160 C136 150 148 148 152 156 C160 156 162 168 156 172 C158 180 146 184 140 178 C132 178 130 166 134 160 Z" fill="#ffffff" stroke="#ad97d6" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
    <!-- torso -->
    <ellipse cx="100" cy="160" rx="40" ry="28" fill="url(#{uid}-fur)" stroke="#ad97d6" stroke-width="3"/>
    <ellipse cx="100" cy="160" rx="19" ry="18" fill="#ffffff"/>
    <!-- big hind feet -->
    <ellipse cx="65" cy="184" rx="17" ry="8" fill="url(#{uid}-fur)" stroke="#ad97d6" stroke-width="3"/>
    <ellipse cx="135" cy="184" rx="17" ry="8" fill="url(#{uid}-fur)" stroke="#ad97d6" stroke-width="3"/>
    <ellipse cx="59" cy="184" rx="5" ry="3.5" fill="#ffc6e2"/>
    <ellipse cx="141" cy="184" rx="5" ry="3.5" fill="#ffc6e2"/>
    <!-- front legs -->
    <g class="mascot-hoof-left">
      <rect x="72" y="158" width="20" height="34" rx="10" fill="url(#{uid}-fur)" stroke="#ad97d6" stroke-width="3"/>
      <path d="M78.5 186.5 v3.5 M85.5 186.5 v3.5" stroke="#ad97d6" stroke-width="2" stroke-linecap="round"/>
    </g>
    <g class="mascot-hoof-right">
      <rect x="108" y="158" width="20" height="34" rx="10" fill="url(#{uid}-fur)" stroke="#ad97d6" stroke-width="3"/>
      <path d="M114.5 186.5 v3.5 M121.5 186.5 v3.5" stroke="#ad97d6" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>

  <g class="mascot-head">
    <!-- long ears -->
    <g class="mascot-ears">
      <ellipse cx="72" cy="40" rx="13.5" ry="31" transform="rotate(-14 72 40)" fill="url(#{uid}-fur)" stroke="#ad97d6" stroke-width="3"/>
      <ellipse cx="72.5" cy="42" rx="6.5" ry="22" transform="rotate(-14 72.5 42)" fill="#ffc6e2"/>
      <ellipse cx="128" cy="40" rx="13.5" ry="31" transform="rotate(14 128 40)" fill="url(#{uid}-fur)" stroke="#ad97d6" stroke-width="3"/>
      <ellipse cx="127.5" cy="42" rx="6.5" ry="22" transform="rotate(14 127.5 42)" fill="#ffc6e2"/>
    </g>

    <!-- head -->
    <ellipse cx="100" cy="92" rx="50" ry="45" fill="url(#{uid}-fur)" stroke="#ad97d6" stroke-width="3"/>
    <!-- little fluff tuft on top -->
    <path d="M90 50 Q93 42 99 47 Q103 40 109 46 Q113 44 112 51" fill="none" stroke="#ad97d6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

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

    <!-- muzzle, nose, mouth -->
    <ellipse cx="93" cy="118" rx="9" ry="7.5" fill="#ffffff"/>
    <ellipse cx="107" cy="118" rx="9" ry="7.5" fill="#ffffff"/>
    <path d="M96 111 H104 Q104 114 100 116 Q96 114 96 111 Z" fill="#ff9fc4" stroke="#ff9fc4" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M100 116 V119 M94 120 Q97 123.5 100 119.5 Q103 123.5 106 120" fill="none" stroke="#8a5a8f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;

export default {
  id: 'konijn',
  noun: 'konijn',
  article: 'het',
  markup,
  defs,
  crown: { x: 100, y: 60, scale: 0.85 },
  css: '',
};
