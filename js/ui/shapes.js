// Big friendly shapes for the colours-and-shapes game: a coloured shape with a
// white sticker outline and a small face.

const PATHS = {
  rondje: '<circle cx="50" cy="50" r="38"/>',
  vierkantje: '<rect x="13" y="13" width="74" height="74" rx="12"/>',
  driehoekje: '<path d="M50 9 L91 86 H9 Z"/>',
  ster: '<path d="M50 6 L62 37 L95 38 L69 58 L78 91 L50 72 L22 91 L31 58 L5 38 L38 37 Z"/>',
  hartje: '<path d="M50 88 C18 66 6 47 10 31 C14 14 36 9 50 26 C64 9 86 14 90 31 C94 47 82 66 50 88 Z"/>',
};

// Where the face sits, so it looks centred in each shape.
const FACE_Y = { rondje: 50, vierkantje: 50, driehoekje: 64, ster: 54, hartje: 46 };

function face(y) {
  return `
    <circle cx="40" cy="${y - 3}" r="4.5" fill="#3b0764"/>
    <circle cx="60" cy="${y - 3}" r="4.5" fill="#3b0764"/>
    <circle cx="41.5" cy="${y - 4.5}" r="1.4" fill="#fff"/>
    <circle cx="61.5" cy="${y - 4.5}" r="1.4" fill="#fff"/>
    <path d="M43 ${y + 5} Q50 ${y + 11} 57 ${y + 5}" fill="none" stroke="#3b0764" stroke-width="3" stroke-linecap="round"/>`;
}

export function shapeSVG(shape, hex) {
  const path = PATHS[shape];
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g transform="translate(2 3)" fill="rgba(76,29,149,0.12)" stroke="rgba(76,29,149,0.12)" stroke-width="9" stroke-linejoin="round">${path}</g>
    <g fill="#fff" stroke="#fff" stroke-width="9" stroke-linejoin="round">${path}</g>
    <g fill="${hex}">${path}</g>
    ${face(FACE_Y[shape])}
  </svg>`;
}
