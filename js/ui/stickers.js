// Sticker book artwork: 4 pages × 9 stickers, plus wardrobe icons for the
// unicorn's accessories. No dependencies; every sticker is a self-contained
// <svg viewBox="0 0 100 100"> string in a die-cut sticker style (white
// outline + subtle shadow). No ids are used, so the same sticker can appear
// many times on one page.

// ---------- helpers ----------
const f = (n) => +n.toFixed(1);
const J = 'stroke-linejoin="round" stroke-linecap="round"';

// `sil` = silhouette shapes without fill/stroke colours (they may set their own
// stroke-width for line-shaped parts). It is drawn twice: as a soft shadow and
// as the thick white sticker border. `art` is the coloured motif on top.
function sticker(sil, art) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`
    + `<g fill="#6b4f8f" stroke="#6b4f8f" stroke-width="9" opacity=".16" transform="translate(1.2 2.4)" ${J}>${sil}</g>`
    + `<g fill="#fff" stroke="#fff" stroke-width="9" ${J}>${sil}</g>${art}</svg>`;
}

const pts = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');

// n-pointed star polygon points
function star(cx, cy, R, r, n = 5, rot = 0) {
  const p = [];
  for (let i = 0; i < 2 * n; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2 + rot;
    const d = i % 2 ? r : R;
    p.push([cx + d * Math.cos(a), cy + d * Math.sin(a)]);
  }
  return pts(p);
}

// 4-pointed twinkle
function twinkle(x, y, R, fill) {
  const k = R * 0.22;
  return `<path d="M${x} ${y - R}Q${f(x + k)} ${f(y - k)} ${x + R} ${y}Q${f(x + k)} ${f(y + k)} ${x} ${y + R}Q${f(x - k)} ${f(y + k)} ${x - R} ${y}Q${f(x - k)} ${f(y - k)} ${x} ${y - R}Z"${fill ? ` fill="${fill}"` : ''}/>`;
}

// wavy closed outline (icing, cookie edge)
function wavy(cx, cy, r, amp, waves, steps = 48) {
  const p = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    const d = r + amp * Math.sin(waves * a);
    p.push(`${f(cx + d * Math.cos(a))} ${f(cy + d * Math.sin(a))}`);
  }
  return `M${p.join('L')}Z`;
}

// cute face: dot eyes with a sparkle, small smile, rosy cheeks
function face(x, y, s = 1, c = '#4a3266') {
  return `<g transform="translate(${x} ${y}) scale(${s})">`
    + `<ellipse cx="-11" cy="5" rx="3.6" ry="2.2" fill="#ff7fae" opacity=".55"/><ellipse cx="11" cy="5" rx="3.6" ry="2.2" fill="#ff7fae" opacity=".55"/>`
    + `<circle cx="-7" cy="0" r="2.7" fill="${c}"/><circle cx="7" cy="0" r="2.7" fill="${c}"/>`
    + `<circle cx="-6.1" cy="-1" r=".9" fill="#fff"/><circle cx="7.9" cy="-1" r=".9" fill="#fff"/>`
    + `<path d="M-3.5 4Q0 7.5 3.5 4" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round"/></g>`;
}

// sleepy face: closed curved eyes
function sleepy(x, y, s = 1, c = '#4a3266') {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round">`
    + `<ellipse cx="-11" cy="5" rx="3.6" ry="2.2" fill="#ff7fae" stroke="none" opacity=".55"/><ellipse cx="11" cy="5" rx="3.6" ry="2.2" fill="#ff7fae" stroke="none" opacity=".55"/>`
    + `<path d="M-10 0Q-7 3 -4 0M4 0Q7 3 10 0M-3 5Q0 8 3 5"/></g>`;
}

const HEART = 'M0 14C-16 4-20-6-16-12C-12-18-4-18 0-10C4-18 12-18 16-12C20-6 16 4 0 14Z';
const cloudSil = (x, y) => `<circle cx="${x - 6}" cy="${y}" r="7"/><circle cx="${x + 2}" cy="${y - 4}" r="8"/><circle cx="${x + 9}" cy="${y + 1}" r="6"/><rect x="${x - 13}" y="${y}" width="28" height="8" rx="4"/>`;

// ---------- page 1: regenboog ----------
const arc = (r, c) => `<path d="M${50 - r} 70A${r} ${r} 0 0 1 ${50 + r} 70" stroke="${c}"/>`;

const regenboog = [
  ['regenboog', 'de regenboog', sticker(
    `<path d="M10 70A40 40 0 0 1 90 70Z"/>${cloudSil(21, 68)}${cloudSil(79, 68)}`,
    `<g fill="none" stroke-width="7.5">${arc(36, '#ff9ec7')}${arc(29, '#ffd36e')}${arc(22, '#9be3c0')}${arc(15, '#b9a6f5')}</g>`
    + `<g fill="#e4f3ff">${cloudSil(21, 68)}${cloudSil(79, 68)}</g>`)],

  ['wolkje', 'het wolkje', (() => {
    const s = '<circle cx="31" cy="56" r="16"/><circle cx="51" cy="44" r="21"/><circle cx="70" cy="55" r="16"/><rect x="15" y="50" width="71" height="25" rx="12.5"/>';
    return sticker(s, `<g fill="#d6ecff">${s}</g><circle cx="45" cy="36" r="6" fill="#fff" opacity=".7"/>${face(50, 60, 1.15)}`);
  })()],

  ['zonnetje', 'het zonnetje', (() => {
    let rays = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      rays += `M${f(50 + 30 * Math.cos(a))} ${f(50 + 30 * Math.sin(a))}L${f(50 + 38 * Math.cos(a))} ${f(50 + 38 * Math.sin(a))}`;
    }
    return sticker(`<path d="${rays}" stroke-width="16"/><circle cx="50" cy="50" r="25"/>`,
      `<path d="${rays}" stroke="#ffb547" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="50" r="25" fill="#ffd95e"/>${face(50, 52, 1.2)}`);
  })()],

  ['hartje', 'het hartje', sticker(
    `<path d="${HEART}" transform="translate(50 52) scale(2.1)"/>`,
    `<path d="${HEART}" transform="translate(50 52) scale(2.1)" fill="#ff8fbf"/><ellipse cx="28" cy="36" rx="6" ry="4" transform="rotate(-35 28 36)" fill="#fff" opacity=".6"/>${face(50, 48, 1.15)}`)],

  ['ster', 'de ster', sticker(
    `<polygon points="${star(50, 54, 38, 18)}" stroke-width="14"/>`,
    `<polygon points="${star(50, 54, 38, 18)}" fill="#ffd95e" stroke="#ffd95e" stroke-width="5" ${J}/>${face(50, 55, 1.05)}`)],

  ['maan', 'de maan', sticker(
    `<path d="M58 14A36 36 0 1 0 86 66A30 30 0 0 1 58 14Z"/>`,
    `<path d="M58 14A36 36 0 1 0 86 66A30 30 0 0 1 58 14Z" fill="#fff0a0"/><circle cx="26" cy="40" r="4" fill="#f7dc72"/><circle cx="40" cy="76" r="3" fill="#f7dc72"/>${sleepy(36, 56, 0.95)}${twinkle(80, 24, 8, '#c8a8f0')}`)],

  ['druppel', 'de druppel', sticker(
    `<path d="M50 12C62 32 76 46 76 63A26 26 0 0 1 24 63C24 46 38 32 50 12Z"/>`,
    `<path d="M50 12C62 32 76 46 76 63A26 26 0 0 1 24 63C24 46 38 32 50 12Z" fill="#9fd8ff"/><path d="M36 52Q34 60 36 66" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>${face(50, 64, 1.05)}`)],

  ['bloem', 'de bloem', (() => {
    let petals = '';
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      petals += `<circle cx="${f(50 + 19 * Math.cos(a))}" cy="${f(44 + 19 * Math.sin(a))}" r="14"/>`;
    }
    const leaves = '<ellipse cx="38" cy="76" rx="9" ry="5" transform="rotate(30 38 76)"/><ellipse cx="62" cy="78" rx="9" ry="5" transform="rotate(-30 62 78)"/>';
    return sticker(`${petals}<path d="M50 60V86" stroke-width="14"/>${leaves}`,
      `<path d="M50 60V86" stroke="#7fcfa0" stroke-width="5" stroke-linecap="round"/><g fill="#8fdcb0">${leaves}</g><g fill="#ffa8d2">${petals}</g><circle cx="50" cy="44" r="13" fill="#ffe27a"/>${face(50, 44, 0.75)}`);
  })()],

  ['toverstaf', 'de toverstaf', sticker(
    `<path d="M22 86L50 54" stroke-width="16"/><polygon points="${star(60, 38, 25, 12, 5, 0.2)}" stroke-width="13"/>${twinkle(22, 30, 9)}${twinkle(84, 74, 8)}`,
    `<path d="M22 86L50 54" stroke="#c8a8f0" stroke-width="7" stroke-linecap="round"/><path d="M28 79L33 73.5M36 70L41 64" stroke="#fff" stroke-width="7" opacity=".7"/>`
    + `<polygon points="${star(60, 38, 25, 12, 5, 0.2)}" fill="#ffd95e" stroke="#ffd95e" stroke-width="4" ${J}/>${face(60, 40, 0.75)}${twinkle(22, 30, 9, '#ff9ec7')}${twinkle(84, 74, 8, '#9be3c0')}`)],
];

// ---------- page 2: zee ----------
const bubbles = (list, fill) => list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"${fill ? ` fill="${fill}" opacity=".85"` : ''}/>`).join('');

const zee = [
  ['vis', 'de vis', (() => {
    const tail = 'M64 50L86 32Q80 50 86 68Z';
    const fin = 'M30 34Q42 18 56 32Z';
    const bub = [[16, 22, 4.5], [26, 13, 3]];
    return sticker(`<path d="${tail}"/><path d="${fin}"/><ellipse cx="42" cy="52" rx="28" ry="21"/>${bubbles(bub)}`,
      `<g fill="#c8a8f0" stroke="#c8a8f0" stroke-width="4" ${J}><path d="${tail}"/><path d="${fin}"/></g><ellipse cx="42" cy="52" rx="28" ry="21" fill="#ff9ec7"/>`
      + '<path d="M52 34Q60 52 52 70M60 38Q66 52 60 66" fill="none" stroke="#ffc0dc" stroke-width="3.5" stroke-linecap="round"/>'
      + '<ellipse cx="44" cy="62" rx="6" ry="3.5" transform="rotate(20 44 62)" fill="#c8a8f0"/>'
      + `${face(34, 50, 0.9)}${bubbles(bub, '#bfe6ff')}`);
  })()],

  ['octopus', 'de octopus', (() => {
    const legs = 'M30 58Q20 74 28 86M42 64Q38 80 44 89M58 64Q62 80 56 89M70 58Q80 74 72 86';
    let dots = '';
    [[24.5, 73], [40.5, 78], [59.5, 78], [75.5, 73]].forEach(([x, y]) => { dots += `<circle cx="${x}" cy="${y}" r="1.8"/>`; });
    return sticker(`<path d="${legs}" stroke-width="18" fill="none"/><circle cx="50" cy="40" r="28"/>`,
      `<path d="${legs}" fill="none" stroke="#b9a6f5" stroke-width="9" stroke-linecap="round"/><g fill="#ece0ff">${dots}</g>`
      + '<circle cx="50" cy="40" r="28" fill="#c8a8f0"/><ellipse cx="37" cy="24" rx="7" ry="4.5" transform="rotate(-30 37 24)" fill="#fff" opacity=".55"/>'
      + face(50, 46, 1.1));
  })()],

  ['walvis', 'de walvis', (() => {
    const body = 'M10 60C10 42 26 36 42 36C60 36 72 48 72 62C72 76 58 84 40 84C22 84 10 76 10 60Z';
    const tail = 'M64 64C74 60 78 52 77 44C71 42 67 36 69 31C75 32 79 36 81 40C83 34 87 31 92 31C92 37 88 43 83 46C83 57 77 66 68 71Z';
    const spout = 'M32 34Q32 26 32 22M32 22Q24 18 22 12M32 22Q40 18 42 12';
    return sticker(`<path d="${tail}"/><path d="${body}"/><path d="${spout}" stroke-width="13" fill="none"/>`,
      `<path d="${spout}" fill="none" stroke="#9fd8ff" stroke-width="4" stroke-linecap="round"/><circle cx="22" cy="12" r="2.6" fill="#9fd8ff"/><circle cx="42" cy="12" r="2.6" fill="#9fd8ff"/>`
      + `<path d="${tail}" fill="#8cc4f5" stroke="#8cc4f5" stroke-width="2" ${J}/><path d="${body}" fill="#9fd0ff"/>`
      + '<path d="M14 68C24 80 52 84 68 72C64 80 54 84 40 84C26 84 16 78 14 68Z" fill="#e4f3ff"/>'
      + '<path d="M46 66Q52 74 58 68" fill="none" stroke="#8cc4f5" stroke-width="3.5" stroke-linecap="round"/>'
      + face(34, 58, 0.95));
  })()],

  ['zeepaardje', 'het zeepaardje', (() => {
    const snout = 'M40 31L24 34';
    const tail = 'M56 66Q64 88 44 88Q32 87 34 77Q36 69 44 72';
    const head = '<circle cx="50" cy="30" r="14"/>';
    const body = '<ellipse cx="54" cy="52" rx="15" ry="19" transform="rotate(-12 54 52)"/>';
    const fin = 'M66 44Q80 46 76 60Q72 58 68 56Z';
    return sticker(`<path d="${snout}" stroke-width="18"/><path d="${tail}" stroke-width="17" fill="none"/><path d="${fin}"/>${head}${body}<path d="M46 16L50 10L54 16" stroke-width="13"/>`,
      `<path d="${fin}" fill="#ffa8cf" stroke="#ffa8cf" stroke-width="3" ${J}/><path d="M68 48L76 50M68 53L75 56" stroke="#ff8fbf" stroke-width="1.8" stroke-linecap="round"/>`
      + `<path d="${tail}" fill="none" stroke="#ffd36e" stroke-width="8" stroke-linecap="round"/><path d="${snout}" stroke="#ffd36e" stroke-width="9" stroke-linecap="round"/>`
      + `<g fill="#ffd95e">${head}${body}</g><path d="M46 16L50 10L54 16" fill="#ffb3d9" stroke="#ffb3d9" stroke-width="4" ${J}/>`
      + '<path d="M44 46Q50 49 56 46M44 54Q50 57 56 54M46 62Q51 65 56 62" fill="none" stroke="#ffbf5e" stroke-width="2.4" stroke-linecap="round"/>'
      + '<ellipse cx="56" cy="35" rx="3.6" ry="2.2" fill="#ff7fae" opacity=".55"/><circle cx="48" cy="28" r="2.7" fill="#4a3266"/><circle cx="48.9" cy="27" r=".9" fill="#fff"/>'
      + '<path d="M38 36Q40 38 43 37" fill="none" stroke="#4a3266" stroke-width="1.7" stroke-linecap="round"/>');
  })()],

  ['schelp', 'de schelp', (() => {
    let bumps = '';
    let ribs = '';
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI + (i * Math.PI) / 6;
      bumps += `<circle cx="${f(50 + 33 * Math.cos(a))}" cy="${f(58 + 33 * Math.sin(a))}" r="7"/>`;
      if (i > 0 && i < 6) ribs += `M50 80L${f(50 + 30 * Math.cos(a))} ${f(58 + 30 * Math.sin(a))}`;
    }
    const fan = 'M50 82L17 58A33 33 0 0 1 83 58Z';
    const hinge = 'M41 76H59L56 87H44Z';
    return sticker(`<path d="${fan}"/>${bumps}<path d="${hinge}"/>`,
      `<path d="${hinge}" fill="#ffa8cf" stroke="#ffa8cf" stroke-width="3" ${J}/><g fill="#ffc0dc"><path d="${fan}"/>${bumps}</g>`
      + `<path d="${ribs}" fill="none" stroke="#ffa8cf" stroke-width="3" stroke-linecap="round"/>`
      + '<ellipse cx="30" cy="38" rx="5" ry="3.5" transform="rotate(-40 30 38)" fill="#fff" opacity=".65"/>'
      + `<ellipse cx="50" cy="56" rx="17" ry="11" fill="#ffc0dc"/>${face(50, 55, 0.95)}`);
  })()],

  ['zeester', 'de zeester', (() => {
    const p = star(50, 53, 37, 17, 5);
    let dots = '';
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      dots += `<circle cx="${f(50 + 26 * Math.cos(a))}" cy="${f(53 + 26 * Math.sin(a))}" r="2.2"/><circle cx="${f(50 + 18 * Math.cos(a))}" cy="${f(53 + 18 * Math.sin(a))}" r="1.6"/>`;
    }
    return sticker(`<polygon points="${p}" stroke-width="19"/>`,
      `<polygon points="${p}" fill="#ffab91" stroke="#ffab91" stroke-width="10" ${J}/><g fill="#ffe0d2">${dots}</g>${face(50, 54, 1)}`);
  })()],

  ['zeemeermin', 'de zeemeermin', (() => {
    const hair = 'M33 34C30 14 70 14 67 34C70 44 72 52 66 58Q60 54 58 46H42Q40 54 34 58C28 52 30 44 33 34Z';
    const tail = 'M39 50H61C64 62 62 72 54 80L50 82L46 80C38 72 36 62 39 50Z';
    const fin = 'M50 79Q40 78 30 88Q42 93 50 85Q58 93 70 88Q60 78 50 79Z';
    return sticker(`<path d="${hair}"/><path d="${tail}"/><path d="${fin}"/><circle cx="50" cy="30" r="13"/>`,
      `<path d="${hair}" fill="#c8a8f0"/><path d="${fin}" fill="#7fcfae" stroke="#7fcfae" stroke-width="3" ${J}/><path d="${tail}" fill="#9be3c0"/>`
      + '<path d="M44 60q3 3 6 0q3 3 6 0M42 67q3 3 6 0M47 74q3 3 6 0" fill="none" stroke="#7fcfae" stroke-width="1.8" stroke-linecap="round"/>'
      + '<rect x="42" y="40" width="16" height="12" rx="5" fill="#ffe3d0"/><circle cx="45.5" cy="46" r="3.6" fill="#ff9ec7"/><circle cx="54.5" cy="46" r="3.6" fill="#ff9ec7"/>'
      + '<circle cx="50" cy="30" r="13" fill="#ffe3d0"/><path d="M37 28C38 18 50 14 58 18C62 20 64 24 63 28C56 28 50 24 47 20C45 24 41 27 37 28Z" fill="#c8a8f0"/>'
      + `${face(50, 31, 0.62)}${twinkle(61, 19, 5, '#ffd95e')}`);
  })()],

  ['krab', 'de krab', (() => {
    const claws = '<circle cx="20" cy="29" r="11"/><circle cx="80" cy="29" r="11"/>';
    const notch = 'M20 30L14 16H26ZM80 30L74 16H86Z';
    const arms = 'M30 56L22 38M70 56L78 38';
    const legs = 'M24 64L13 62M24 71L13 74M28 77L18 84M76 64L87 62M76 71L87 74M72 77L82 84';
    const stalks = 'M42 48L40 38M58 48L60 38';
    return sticker(`${claws}<path d="${arms}${legs}${stalks}" stroke-width="15"/><circle cx="40" cy="34" r="7"/><circle cx="60" cy="34" r="7"/><ellipse cx="50" cy="64" rx="28" ry="19"/>`,
      `<path d="${arms}${legs}${stalks}" stroke="#ff8a8a" stroke-width="5" stroke-linecap="round"/><g fill="#ff8a8a">${claws}</g><path d="${notch}" fill="#fff" stroke="#fff" stroke-width="2" ${J}/>`
      + '<ellipse cx="50" cy="64" rx="28" ry="19" fill="#ff9e9e"/><ellipse cx="38" cy="54" rx="6" ry="3.5" transform="rotate(-20 38 54)" fill="#fff" opacity=".5"/>'
      + '<g><circle cx="40" cy="34" r="7" fill="#fff"/><circle cx="60" cy="34" r="7" fill="#fff"/><circle cx="40.5" cy="35" r="3.6" fill="#4a3266"/><circle cx="59.5" cy="35" r="3.6" fill="#4a3266"/><circle cx="41.8" cy="33.6" r="1.2" fill="#fff"/><circle cx="60.8" cy="33.6" r="1.2" fill="#fff"/></g>'
      + '<ellipse cx="36" cy="68" rx="4" ry="2.4" fill="#ff6b8f" opacity=".45"/><ellipse cx="64" cy="68" rx="4" ry="2.4" fill="#ff6b8f" opacity=".45"/>'
      + '<path d="M45 66Q50 71 55 66" fill="none" stroke="#4a3266" stroke-width="1.9" stroke-linecap="round"/>');
  })()],

  ['kwal', 'de kwal', (() => {
    const dome = 'M20 52C20 22 80 22 80 52Q72.5 58 65 52Q57.5 58 50 52Q42.5 58 35 52Q27.5 58 20 52Z';
    const t = 'M30 57Q24 66 30 74Q36 82 30 90M43 58Q38 67 43 75Q48 83 43 88M57 58Q62 67 57 75Q52 83 57 88M70 57Q76 66 70 74Q64 82 70 90';
    return sticker(`<path d="${t}" stroke-width="13" fill="none"/><path d="${dome}"/>`,
      `<path d="${t}" fill="none" stroke="#c8a8f0" stroke-width="4" stroke-linecap="round"/>`
      + `<path d="${dome}" fill="#ffb3d9" stroke="#ffb3d9" stroke-width="2" ${J}/><path d="M24 50Q30 54 35 50Q42 54 50 50Q58 54 65 50Q70 54 76 50" fill="none" stroke="#ff9ec7" stroke-width="3" stroke-linecap="round"/>`
      + '<ellipse cx="36" cy="32" rx="6" ry="3.5" transform="rotate(-30 36 32)" fill="#fff" opacity=".6"/><circle cx="64" cy="30" r="2" fill="#fff" opacity=".6"/>'
      + face(50, 42, 1));
  })()],
];

// ---------- page 3: dieren ----------
const whiskers = (x, y) => `<path d="M${x - 14} ${y}H${x - 26}M${x - 14} ${y + 4}L${x - 25} ${y + 8}M${x + 14} ${y}H${x + 26}M${x + 14} ${y + 4}L${x + 25} ${y + 8}" stroke="#c99a7c" stroke-width="1.6" stroke-linecap="round"/>`;
const nose = (x, y, c = '#ff7fae') => `<path d="M${x - 2.5} ${y}H${x + 2.5}L${x} ${y + 2.5}Z" fill="${c}" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>`;

const dieren = [
  ['kat', 'de kat', (() => {
    const ears = 'M22 46L22 14L46 32ZM78 46L78 14L54 32Z';
    return sticker(`<path d="${ears}"/><ellipse cx="50" cy="58" rx="33" ry="28"/>`,
      `<path d="${ears}" fill="#ffc994" stroke="#ffc994" stroke-width="4" stroke-linejoin="round"/><path d="M26 38L26 23L38 32ZM74 38L74 23L62 32Z" fill="#ffb3d1"/>`
      + '<ellipse cx="50" cy="58" rx="33" ry="28" fill="#ffd8b0"/><path d="M44 31L46 39M50 30V39M56 31L54 39" stroke="#f5b27a" stroke-width="3" stroke-linecap="round"/>'
      + `${whiskers(50, 66)}${face(50, 58, 1.1)}${nose(50, 61)}`);
  })()],

  ['konijn', 'het konijn', sticker(
    '<ellipse cx="37" cy="30" rx="9" ry="21" transform="rotate(-10 37 30)"/><ellipse cx="63" cy="30" rx="9" ry="21" transform="rotate(10 63 30)"/><ellipse cx="50" cy="63" rx="30" ry="25"/>',
    '<ellipse cx="37" cy="30" rx="9" ry="21" transform="rotate(-10 37 30)" fill="#efe4fa"/><ellipse cx="63" cy="30" rx="9" ry="21" transform="rotate(10 63 30)" fill="#efe4fa"/>'
    + '<ellipse cx="37" cy="31" rx="4.5" ry="15" transform="rotate(-10 37 31)" fill="#ffc0dc"/><ellipse cx="63" cy="31" rx="4.5" ry="15" transform="rotate(10 63 31)" fill="#ffc0dc"/>'
    + `<ellipse cx="50" cy="63" rx="30" ry="25" fill="#efe4fa"/>${face(50, 62, 1.1)}${nose(50, 66)}<rect x="47.5" y="71" width="5" height="5" rx="1.5" fill="#fff" stroke="#d8c8ee" stroke-width="1"/>`)],

  ['vos', 'de vos', (() => {
    const head = 'M14 34C30 36 40 40 50 40C60 40 70 36 86 34C84 56 72 76 50 86C28 76 16 56 14 34Z';
    const ears = 'M16 36L24 10L44 38ZM84 36L76 10L56 38Z';
    return sticker(`<path d="${ears}"/><path d="${head}"/>`,
      `<path d="${ears}" fill="#ffa868" stroke="#ffa868" stroke-width="4" stroke-linejoin="round"/><path d="M24 32L27 19L36 34ZM76 32L73 19L64 34Z" fill="#fff1e3"/>`
      + `<path d="${head}" fill="#ffad6b"/><path d="M22 52C34 56 44 62 50 72C56 62 66 56 78 52C72 70 62 80 50 86C38 80 28 70 22 52Z" fill="#fff4ea"/>`
      + `${face(50, 56, 1.05)}<ellipse cx="50" cy="78" rx="4" ry="3" fill="#4a3266"/>`);
  })()],

  ['uil', 'de uil', sticker(
    '<path d="M22 28L34 14L40 26ZM78 28L66 14L60 26Z"/><ellipse cx="50" cy="54" rx="30" ry="34"/>',
    '<path d="M22 28L34 14L40 26ZM78 28L66 14L60 26Z" fill="#b28fe6" stroke="#b28fe6" stroke-width="4" stroke-linejoin="round"/>'
    + '<ellipse cx="50" cy="54" rx="30" ry="34" fill="#c8a8f0"/><ellipse cx="22" cy="60" rx="7" ry="16" transform="rotate(12 22 60)" fill="#b28fe6"/><ellipse cx="78" cy="60" rx="7" ry="16" transform="rotate(-12 78 60)" fill="#b28fe6"/>'
    + '<ellipse cx="50" cy="66" rx="18" ry="19" fill="#ece0ff"/><path d="M42 62q3 3 6 0M52 62q3 3 6 0M47 70q3 3 6 0M42 78q3 3 6 0M52 78q3 3 6 0" fill="none" stroke="#c8a8f0" stroke-width="1.6" stroke-linecap="round"/>'
    + '<circle cx="38" cy="42" r="11" fill="#fff"/><circle cx="62" cy="42" r="11" fill="#fff"/><circle cx="39" cy="43" r="5.5" fill="#4a3266"/><circle cx="61" cy="43" r="5.5" fill="#4a3266"/><circle cx="41" cy="41" r="1.8" fill="#fff"/><circle cx="63" cy="41" r="1.8" fill="#fff"/>'
    + '<path d="M46 52H54L50 58Z" fill="#ffc35c" stroke="#ffc35c" stroke-width="2" stroke-linejoin="round"/><ellipse cx="27" cy="54" rx="3.6" ry="2.2" fill="#ff7fae" opacity=".55"/><ellipse cx="73" cy="54" rx="3.6" ry="2.2" fill="#ff7fae" opacity=".55"/>'
    + '<path d="M40 87v3M44 87v3M56 87v3M60 87v3" stroke="#ffc35c" stroke-width="3" stroke-linecap="round"/>')],

  ['vlinder', 'de vlinder', (() => {
    const w = '<ellipse cx="31" cy="36" rx="19" ry="17" transform="rotate(-25 31 36)"/><ellipse cx="69" cy="36" rx="19" ry="17" transform="rotate(25 69 36)"/><ellipse cx="34" cy="66" rx="14" ry="13"/><ellipse cx="66" cy="66" rx="14" ry="13"/>';
    return sticker(`${w}<ellipse cx="50" cy="54" rx="6" ry="24"/><path d="M46 30Q40 16 34 14M54 30Q60 16 66 14" stroke-width="11" fill="none"/>`,
      '<path d="M46 30Q40 16 34 14M54 30Q60 16 66 14" fill="none" stroke="#8a6bb8" stroke-width="2" stroke-linecap="round"/><circle cx="34" cy="14" r="2.6" fill="#8a6bb8"/><circle cx="66" cy="14" r="2.6" fill="#8a6bb8"/>'
      + '<g fill="#ffa8d2"><ellipse cx="31" cy="36" rx="19" ry="17" transform="rotate(-25 31 36)"/><ellipse cx="69" cy="36" rx="19" ry="17" transform="rotate(25 69 36)"/></g>'
      + '<g fill="#c8b2f5"><ellipse cx="34" cy="66" rx="14" ry="13"/><ellipse cx="66" cy="66" rx="14" ry="13"/></g>'
      + '<g fill="#fff3b0"><circle cx="27" cy="34" r="5"/><circle cx="73" cy="34" r="5"/><circle cx="32" cy="68" r="3.5"/><circle cx="68" cy="68" r="3.5"/></g>'
      + `<ellipse cx="50" cy="54" rx="6" ry="24" fill="#8a6bb8"/><circle cx="50" cy="34" r="8" fill="#8a6bb8"/>${face(50, 34, 0.42, '#fff')}`);
  })()],

  ['lieveheersbeestje', 'het lieveheersbeestje', sticker(
    '<circle cx="50" cy="32" r="16"/><circle cx="50" cy="58" r="30"/><path d="M42 18L36 9M58 18L64 9" stroke-width="11"/><path d="M22 52H15M22 66L15 70M78 52H85M78 66L85 70" stroke-width="12"/>',
    '<path d="M42 18L36 9M58 18L64 9" stroke="#4a3266" stroke-width="2.4" stroke-linecap="round"/><circle cx="36" cy="9" r="3" fill="#4a3266"/><circle cx="64" cy="9" r="3" fill="#4a3266"/>'
    + '<g stroke="#4a3266" stroke-width="3" stroke-linecap="round"><path d="M22 52H15M22 66L15 70M78 52H85M78 66L85 70"/></g>'
    + '<circle cx="50" cy="32" r="16" fill="#4a3266"/><circle cx="50" cy="58" r="30" fill="#ff6b81"/><path d="M50 30V88" stroke="#4a3266" stroke-width="2.4"/>'
    + '<g fill="#4a3266"><circle cx="36" cy="50" r="5"/><circle cx="64" cy="50" r="5"/><circle cx="33" cy="70" r="4.5"/><circle cx="67" cy="70" r="4.5"/><circle cx="44" cy="80" r="3"/><circle cx="56" cy="80" r="3"/></g>'
    + '<path d="M38 28A16 16 0 0 1 62 28Z" fill="#4a3266"/>' + face(50, 23, 0.6, '#fff'))],

  ['schildpad', 'de schildpad', sticker(
    '<circle cx="77" cy="55" r="11"/><ellipse cx="22" cy="72" rx="7" ry="6"/><ellipse cx="58" cy="72" rx="7" ry="6"/><path d="M8 66C8 40 24 26 40 26C56 26 72 40 72 66Z"/>',
    '<circle cx="77" cy="55" r="11" fill="#b9eecb"/><ellipse cx="22" cy="72" rx="7" ry="6" fill="#a8e6c0"/><ellipse cx="58" cy="72" rx="7" ry="6" fill="#a8e6c0"/>'
    + '<path d="M8 66C8 40 24 26 40 26C56 26 72 40 72 66Z" fill="#8fd6b0"/><path d="M30 40L40 34L50 40L50 52L40 58L30 52ZM30 52L20 58M50 52L60 58M40 58V66M30 40L24 34M50 40L56 34" fill="#a8e6c0" stroke="#6cc49e" stroke-width="2.4" stroke-linejoin="round"/>'
    + '<rect x="6" y="62" width="68" height="8" rx="4" fill="#6cc49e"/>' + face(78, 53, 0.55))],

  ['egel', 'de egel', (() => {
    const spikes = star(50, 50, 39, 30, 14);
    return sticker(`<polygon points="${spikes}"/>`,
      `<polygon points="${spikes}" fill="#c89a7a" stroke="#c89a7a" stroke-width="3" ${J}/><circle cx="50" cy="50" r="30" fill="#b5866a"/>`
      + '<circle cx="31" cy="45" r="5" fill="#ffe6cf"/><circle cx="69" cy="45" r="5" fill="#ffe6cf"/><ellipse cx="50" cy="60" rx="24" ry="20" fill="#ffe6cf"/>'
      + `${face(50, 57, 1)}<ellipse cx="50" cy="68" rx="3.5" ry="2.6" fill="#4a3266"/>`);
  })()],

  ['panda', 'de panda', sticker(
    '<circle cx="24" cy="30" r="12"/><circle cx="76" cy="30" r="12"/><ellipse cx="50" cy="56" rx="35" ry="31"/>',
    '<circle cx="24" cy="30" r="12" fill="#5b4a6e"/><circle cx="76" cy="30" r="12" fill="#5b4a6e"/><circle cx="24" cy="30" r="5.5" fill="#ffb3d1"/><circle cx="76" cy="30" r="5.5" fill="#ffb3d1"/>'
    + '<ellipse cx="50" cy="56" rx="35" ry="31" fill="#fbf8ff" stroke="#e2d6f0" stroke-width="2"/>'
    + '<ellipse cx="35" cy="54" rx="9" ry="12" transform="rotate(35 35 54)" fill="#5b4a6e"/><ellipse cx="65" cy="54" rx="9" ry="12" transform="rotate(-35 65 54)" fill="#5b4a6e"/>'
    + '<circle cx="36" cy="54" r="3" fill="#fff"/><circle cx="64" cy="54" r="3" fill="#fff"/>'
    + '<ellipse cx="50" cy="66" rx="4.5" ry="3" fill="#5b4a6e"/><path d="M45 71Q50 75 55 71" fill="none" stroke="#5b4a6e" stroke-width="1.9" stroke-linecap="round"/>'
    + '<ellipse cx="27" cy="69" rx="4.5" ry="2.6" fill="#ff7fae" opacity=".55"/><ellipse cx="73" cy="69" rx="4.5" ry="2.6" fill="#ff7fae" opacity=".55"/>')],
];

// ---------- page 4: ruimte ----------
const ruimte = [
  ['raket', 'de raket', (() => {
    const body = 'M50 8C64 20 68 40 66 66H34C32 40 36 20 50 8Z';
    const fins = 'M35 50L22 68L24 78L36 68ZM65 50L78 68L76 78L64 68Z';
    return sticker(`<path d="${body}"/><path d="${fins}"/><path d="M41 70Q50 96 59 70Z"/>`,
      '<path d="M41 70Q50 96 59 70Z" fill="#ffd95e"/><path d="M45 70Q50 86 55 70Z" fill="#ffad5b"/>'
      + `<path d="${fins}" fill="#ff8fbf" stroke="#ff8fbf" stroke-width="3" stroke-linejoin="round"/><path d="${body}" fill="#ece4fb"/>`
      + '<path d="M50 8C56 13 60 20 62 26H38C40 20 44 13 50 8Z" fill="#ff8fbf"/><rect x="40" y="64" width="20" height="8" rx="3" fill="#b48ad6"/>'
      + `<circle cx="50" cy="44" r="11" fill="#bfe6ff" stroke="#b48ad6" stroke-width="3.5"/>${face(50, 44, 0.55)}`);
  })()],

  ['planeet', 'de planeet', sticker(
    '<ellipse cx="50" cy="52" rx="38" ry="12" transform="rotate(-15 50 52)" stroke-width="15"/><circle cx="50" cy="50" r="25"/>',
    '<g transform="rotate(-15 50 52)"><ellipse cx="50" cy="52" rx="38" ry="12" fill="none" stroke="#ffd36e" stroke-width="6"/></g>'
    + '<circle cx="50" cy="50" r="25" fill="#c8a8f0"/><path d="M28 40Q50 46 72 38M26 58Q50 64 74 56" fill="none" stroke="#b48ad6" stroke-width="4" stroke-linecap="round"/>'
    + face(50, 48, 0.95)
    + '<g transform="rotate(-15 50 52)"><path d="M12 52A38 12 0 0 0 88 52" fill="none" stroke="#ffd36e" stroke-width="6" stroke-linecap="round"/></g>')],

  ['ster', 'het sterretje', sticker(
    `${twinkle(50, 52, 38)}${twinkle(82, 20, 10)}${twinkle(20, 82, 8)}`,
    `${twinkle(50, 52, 38, '#ffe27a')}${twinkle(82, 20, 10, '#ff9ec7')}${twinkle(20, 82, 8, '#9be3c0')}${face(50, 52, 0.8)}`)],

  ['maan', 'de volle maan', sticker(
    '<circle cx="50" cy="50" r="36"/>',
    '<circle cx="50" cy="50" r="36" fill="#fff0b3"/><g fill="#f5dc85"><circle cx="30" cy="34" r="6"/><circle cx="68" cy="28" r="4"/><circle cx="72" cy="68" r="7"/><circle cx="32" cy="72" r="4"/></g>'
    + sleepy(50, 52, 1.15))],

  ['komeet', 'de komeet', sticker(
    '<path d="M58 30L22 58M62 42L16 84M70 48L42 86" stroke-width="16"/><circle cx="66" cy="34" r="17"/>',
    '<g stroke-width="7" stroke-linecap="round"><path d="M58 30L22 58" stroke="#ff9ec7"/><path d="M62 42L16 84" stroke="#c8b2f5"/><path d="M70 48L42 86" stroke="#9be3c0"/></g>'
    + `<circle cx="66" cy="34" r="17" fill="#ffe27a"/>${face(67, 35, 0.85)}`)],

  ['astronaut', 'de astronaut', sticker(
    '<rect x="30" y="58" width="40" height="32" rx="12"/><circle cx="50" cy="40" r="27"/><path d="M50 13V7" stroke-width="12"/>',
    '<rect x="30" y="58" width="40" height="32" rx="12" fill="#ece4fb" stroke="#c7b4ea" stroke-width="2"/><rect x="42" y="68" width="16" height="11" rx="3" fill="#c8a8f0"/><circle cx="46" cy="73.5" r="2" fill="#ff8fbf"/><circle cx="54" cy="73.5" r="2" fill="#9be3c0"/>'
    + '<path d="M50 13V7" stroke="#c7b4ea" stroke-width="2.5"/><circle cx="50" cy="6" r="3" fill="#ff8fbf"/>'
    + '<circle cx="50" cy="40" r="27" fill="#ece4fb" stroke="#c7b4ea" stroke-width="2"/><ellipse cx="50" cy="42" rx="19" ry="16" fill="#ffe3d0" stroke="#b48ad6" stroke-width="3"/>'
    + `${face(50, 42, 0.95)}<path d="M37 34Q40 29 46 28" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`)],

  ['ufo', 'de ufo', sticker(
    '<path d="M38 60L26 92H74L62 60Z"/><circle cx="50" cy="42" r="18"/><path d="M45 28L41 19M55 28L59 19" stroke-width="12"/><ellipse cx="50" cy="54" rx="40" ry="12"/>',
    '<path d="M38 60L26 92H74L62 60Z" fill="#fff3b0" opacity=".85"/>'
    + '<path d="M45 30L41 20M55 30L59 20" stroke="#7fcf8e" stroke-width="2" stroke-linecap="round"/><circle cx="41" cy="20" r="2.4" fill="#7fcf8e"/><circle cx="59" cy="20" r="2.4" fill="#7fcf8e"/>'
    + `<circle cx="50" cy="38" r="11" fill="#a8e6a1"/>${face(50, 37, 0.55)}<path d="M32 42A18 18 0 0 1 68 42Z" fill="#bfe9ff" opacity=".45"/><path d="M37 36Q40 29 46 27" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`
    + '<ellipse cx="50" cy="54" rx="40" ry="12" fill="#c8a8f0"/><ellipse cx="50" cy="60" rx="24" ry="6" fill="#b48ad6"/>'
    + '<g fill="#ffe27a"><circle cx="22" cy="54" r="3"/><circle cx="36" cy="57" r="3"/><circle cx="50" cy="58" r="3"/><circle cx="64" cy="57" r="3"/><circle cx="78" cy="54" r="3"/></g>')],

  ['aarde', 'de aarde', sticker(
    '<circle cx="50" cy="50" r="36"/>',
    '<circle cx="50" cy="50" r="36" fill="#8fd0ff"/><g fill="#9be3a8">'
    + '<path d="M30 24C40 18 48 24 44 32C40 38 30 36 26 42C19 38 21 29 30 24Z"/><path d="M62 64C70 60 78 63 77 70C75 76 68 78 63 75C59 72 58 66 62 64Z"/><path d="M66 20C74 22 80 28 78 34C72 34 66 30 66 20Z"/><path d="M20 58C26 56 30 62 28 70C24 70 20 66 20 58Z"/></g>'
    + '<path d="M30 74Q34 70 40 72" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>' + face(50, 52, 1.1))],

  ['sterrenbeeld', 'het sterrenbeeld', (() => {
    const p = [[50, 74], [28, 54], [26, 37], [37, 28], [50, 39], [63, 28], [74, 37], [72, 54]];
    const line = `M${p.map(([x, y]) => `${x} ${y}`).join('L')}Z`;
    return sticker('<rect x="12" y="12" width="76" height="76" rx="18"/>',
      '<rect x="12" y="12" width="76" height="76" rx="18" fill="#5b4a9a"/>'
      + '<g fill="#fff" opacity=".7"><circle cx="20" cy="22" r="1"/><circle cx="80" cy="76" r="1.2"/><circle cx="50" cy="20" r="1"/><circle cx="20" cy="76" r="1"/><circle cx="80" cy="22" r="1"/><circle cx="50" cy="56" r="1.2"/></g>'
      + `<path d="${line}" fill="none" stroke="#c8b8ff" stroke-width="1.8" stroke-dasharray="3 2.5"/>`
      + p.map(([x, y], i) => twinkle(x, y, i % 2 ? 4.5 : 6, '#ffe27a')).join(''));
  })()],
];

// ---------- exports ----------
const page = (id, title, list) => ({
  id, title,
  stickers: list.map(([sid, name, svg]) => ({ id: `${id}-${sid}`, name, svg })),
});

export const STICKER_PAGES = [
  page('regenboog', 'Regenboog', regenboog),
  page('zee', 'Zee', zee),
  page('dieren', 'Dieren', dieren),
  page('ruimte', 'Ruimte', ruimte),
];

export const ACCESSORIES = [
  { id: 'regenboog', name: 'een regenboog', page: 'regenboog' },
  { id: 'schelpenkroon', name: 'de schelpenkroon', page: 'zee' },
  { id: 'konijntje', name: 'een konijntje', page: 'dieren' },
  { id: 'planeet', name: 'een planeet met sterren', page: 'ruimte' },
];

// scallop shell for the crown icon, hinge at the local origin, opening upwards
const SHELL = 'M0 1L-11-9C-13-13-11-17-8-17C-7-21-2-22 0-19C2-22 7-21 8-17C11-17 13-13 11-9Z';
const shellAt = (x, y, rot, s, fill, line) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`
  + `<path d="${SHELL}" fill="${fill}"/><path d="M0 0L-6-14M0 0V-17M0 0L6-14" fill="none" stroke="${line}" stroke-width="1.6" stroke-linecap="round"/></g>`;
const shellSil = (x, y, rot, s) => `<path d="${SHELL}" transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" stroke-width="${f(9 / s)}"/>`;
const pearlAt = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffaf2" stroke="#d8c3e8" stroke-width="1.4"/><circle cx="${f(x - r * 0.35)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.32)}" fill="#fff"/>`;
const CROWN_SHELLS = [[27, 62, -30, 1.45], [73, 62, 30, 1.45], [50, 60, 0, 2.1]];

const RING = (half) => `<path d="M10 52A34 9 0 0 ${half} 78 52" transform="rotate(-20 44 52)" fill="none"`;

export const ACCESSORY_ICONS = {
  regenboog: sticker(
    `<path d="M12 72A38 38 0 0 1 88 72Z"/>${cloudSil(22, 70)}${cloudSil(78, 70)}${twinkle(84, 20, 8)}`,
    `<g fill="none" stroke-width="7">${[[35, '#ffb3d9'], [28, '#ffe08a'], [21, '#a8e6cf'], [14, '#c8b2f5']].map(([r, c]) => `<path d="M${50 - r} 72A${r} ${r} 0 0 1 ${50 + r} 72" stroke="${c}"/>`).join('')}</g>`
    + `<g fill="#f4f9ff">${cloudSil(22, 70)}${cloudSil(78, 70)}</g>${twinkle(84, 20, 8, '#ffd95e')}`),

  schelpenkroon: sticker(
    `${CROWN_SHELLS.map(([x, y, r, k]) => shellSil(x, y, r, k)).join('')}<rect x="16" y="56" width="68" height="18" rx="7"/>`,
    '<path d="M24 60L36 44H64L76 60Z" fill="#8fdcb8"/><rect x="16" y="56" width="68" height="18" rx="7" fill="#a8e6cf"/><path d="M21 71H79" stroke="#8fdcb8" stroke-width="3" stroke-linecap="round"/>'
    + shellAt(27, 62, -30, 1.45, '#d9c6fa', '#b48ad6') + shellAt(73, 62, 30, 1.45, '#d9c6fa', '#b48ad6') + shellAt(50, 60, 0, 2.1, '#ffc0dc', '#ff9ec7')
    + pearlAt(24, 66, 3.6) + pearlAt(37, 66.5, 4.2) + pearlAt(50, 67, 5) + pearlAt(63, 66.5, 4.2) + pearlAt(76, 66, 3.6)
    + '<ellipse cx="42" cy="34" rx="3.5" ry="2.4" transform="rotate(-40 42 34)" fill="#fff" opacity=".7"/>'),

  konijntje: (() => {
    const ears = '<ellipse cx="42" cy="23" rx="6.5" ry="14" transform="rotate(-12 42 23)"/><ellipse cx="58" cy="23" rx="6.5" ry="14" transform="rotate(12 58 23)"/>';
    const body = '<circle cx="68" cy="76" r="6"/><ellipse cx="50" cy="73" rx="19" ry="15"/><ellipse cx="39" cy="86" rx="8.5" ry="5"/><ellipse cx="61" cy="86" rx="8.5" ry="5"/><circle cx="50" cy="46" r="17"/>';
    return sticker(`${ears}${body}`,
      `<g fill="#efe4fa">${ears}</g><ellipse cx="42" cy="24" rx="3" ry="9.5" transform="rotate(-12 42 24)" fill="#ffc0dc"/><ellipse cx="58" cy="24" rx="3" ry="9.5" transform="rotate(12 58 24)" fill="#ffc0dc"/>`
      + `<g fill="#efe4fa">${body}</g><circle cx="68" cy="76" r="6" fill="#fff"/><ellipse cx="50" cy="75" rx="10" ry="8" fill="#fbf6ff"/>`
      + `${face(50, 47, 0.8)}${nose(50, 50)}`);
  })(),

  planeet: sticker(
    `${RING(1)} stroke-width="16"/><circle cx="44" cy="52" r="21"/>${twinkle(80, 22, 9)}${twinkle(80, 79, 7)}${twinkle(17, 19, 6.5)}`,
    `${RING(1)} stroke="#f2bf4f" stroke-width="6.5" stroke-linecap="round"/><circle cx="44" cy="52" r="21" fill="#ffb3d9"/>`
    + '<path d="M25 46Q44 52 63 43M26 60Q44 66 62 56" fill="none" stroke="#ffd1e8" stroke-width="4" stroke-linecap="round"/><circle cx="36" cy="40" r="4" fill="#fff" opacity=".7"/>'
    + `${RING(0)} stroke="#ffd36e" stroke-width="6.5" stroke-linecap="round"/>`
    + `${twinkle(80, 22, 9, '#ffe27a')}${twinkle(80, 79, 7, '#ffe27a')}${twinkle(17, 19, 6.5, '#ffe27a')}`),
};
