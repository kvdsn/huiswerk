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

// ---------- page 2: snoep ----------
function spiral(cx, cy, maxR, turns = 2.6, steps = 44) {
  const p = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * 2 * Math.PI;
    p.push(`${f(cx + maxR * t * Math.cos(a))} ${f(cy + maxR * t * Math.sin(a))}`);
  }
  return `M${p.join('L')}`;
}
const sprinkle = (x, y, r, c) => `<path d="M${x} ${y}l3 0" transform="rotate(${r} ${x} ${y})" stroke="${c}"/>`;

const snoep = [
  ['lolly', 'de lolly', sticker(
    '<circle cx="50" cy="40" r="28"/><rect x="46" y="60" width="8" height="28" rx="4"/>',
    '<rect x="46" y="60" width="8" height="28" rx="4" fill="#e3d4f7"/><circle cx="50" cy="40" r="28" fill="#ff9ec7"/>'
    + `<path d="${spiral(50, 40, 24)}" fill="none" stroke="#fff3f9" stroke-width="4.5" stroke-linecap="round"/>`
    + '<path d="M50 70l-9-5v10zM50 70l9-5v10z" fill="#9be3c0" stroke="#9be3c0" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="70" r="3" fill="#7fcfae"/>')],

  ['cupcake', 'de cupcake', (() => {
    const wrap = 'M26 58H74L67 88H33Z';
    const frost = 'M22 60C17 48 28 40 35 42C37 27 63 27 65 42C72 40 83 48 78 60Z';
    return sticker(`<path d="${wrap}"/><path d="${frost}"/><circle cx="50" cy="26" r="7"/>`,
      `<path d="${wrap}" fill="#9be3c0"/><path d="M38 58L40 88M50 58V88M62 58L60 88" stroke="#7fcfae" stroke-width="3"/>`
      + `<path d="${frost}" fill="#ffb3d9"/><circle cx="50" cy="26" r="7" fill="#ff6b8f"/><path d="M50 20Q52 13 57 11" fill="none" stroke="#7fcfa0" stroke-width="2.5" stroke-linecap="round"/><circle cx="47.5" cy="23.5" r="2" fill="#fff" opacity=".7"/>`
      + `<g stroke-width="2.5" stroke-linecap="round">${sprinkle(32, 50, 30, '#fff3b0')}${sprinkle(44, 40, -20, '#b9a6f5')}${sprinkle(60, 44, 50, '#fff')}${sprinkle(68, 53, -10, '#9be3c0')}</g>${face(50, 70, 0.9)}`);
  })()],

  ['ijsje', 'het ijsje', sticker(
    '<path d="M32 52H68L50 92Z"/><circle cx="38" cy="47" r="14"/><circle cx="62" cy="47" r="14"/><circle cx="50" cy="31" r="17"/>',
    '<path d="M32 52H68L50 92Z" fill="#f5c98a" stroke="#f5c98a" stroke-width="3" stroke-linejoin="round"/><path d="M38 60L52 76M48 58L58 69M62 60L48 76M52 58L42 69" stroke="#e0a95c" stroke-width="2" stroke-linecap="round"/>'
    + '<circle cx="38" cy="47" r="14" fill="#9be3c0"/><circle cx="62" cy="47" r="14" fill="#c8b2f5"/><circle cx="50" cy="31" r="17" fill="#ffa8cf"/><circle cx="43" cy="22" r="3.5" fill="#fff" opacity=".6"/>'
    + face(50, 33, 0.95))],

  ['donut', 'de donut', sticker(
    '<circle cx="50" cy="50" r="35"/>',
    '<circle cx="50" cy="50" r="35" fill="#f2c48d"/>'
    + `<path d="${wavy(50, 50, 28, 2.5, 8)}" fill="#ff9ec7"/><circle cx="50" cy="44" r="12" fill="#e9b47a"/><circle cx="50" cy="44" r="8.5" fill="#fff"/>`
    + `<g stroke-width="2.6" stroke-linecap="round">${sprinkle(30, 36, 40, '#fff3b0')}${sprinkle(40, 26, -30, '#9be3c0')}${sprinkle(62, 26, 20, '#fff')}${sprinkle(70, 40, 80, '#b9a6f5')}${sprinkle(30, 58, -50, '#b9a6f5')}${sprinkle(68, 60, 10, '#fff3b0')}</g>`
    + face(50, 66, 0.85))],

  ['snoepje', 'het snoepje', (() => {
    const L = 'M30 46L11 33Q7 50 11 67L30 54Z';
    const R = 'M70 46L89 33Q93 50 89 67L70 54Z';
    return sticker(`<path d="${L}"/><path d="${R}"/><ellipse cx="50" cy="50" rx="23" ry="18"/>`,
      `<g fill="#d9c6fa" stroke="#d9c6fa" stroke-width="3" stroke-linejoin="round"><path d="${L}"/><path d="${R}"/></g><path d="M14 42L24 47M14 58L24 53M86 42L76 47M86 58L76 53" stroke="#b9a6f5" stroke-width="2" stroke-linecap="round"/>`
      + '<ellipse cx="50" cy="50" rx="23" ry="18" fill="#c8a8f0"/><path d="M36 36Q30 50 36 64M64 36Q70 50 64 64" fill="none" stroke="#fff" stroke-width="3.5" opacity=".55"/>'
      + face(50, 49, 0.95));
  })()],

  ['taart', 'de taart', (() => {
    const drip = 'M20 58Q20 46 32 46H68Q80 46 80 58Q76 64 72 58Q68 52 64 60Q60 66 56 58Q52 52 48 60Q44 66 40 58Q36 52 32 60Q28 66 24 58Z';
    return sticker('<rect x="20" y="46" width="60" height="42" rx="7"/><rect x="46" y="26" width="8" height="22"/><ellipse cx="50" cy="20" rx="5" ry="7"/>',
      '<rect x="20" y="46" width="60" height="42" rx="7" fill="#ffe3f1"/><rect x="20" y="70" width="60" height="6" fill="#ffb3d9"/>'
      + `<path d="${drip}" fill="#ff9ec7"/><rect x="46" y="27" width="8" height="20" rx="2" fill="#9be3c0"/><path d="M46 33L54 29M46 40L54 36" stroke="#fff" stroke-width="2"/>`
      + '<path d="M50 12Q57 20 55 24Q53 28 50 28Q47 28 45 24Q43 20 50 12Z" fill="#ffd95e"/><ellipse cx="50" cy="23" rx="2" ry="3" fill="#ffad5b"/>'
      + '<circle cx="30" cy="48" r="3" fill="#ff6b8f"/><circle cx="70" cy="48" r="3" fill="#ff6b8f"/>'
      + face(50, 80, 0.85));
  })()],

  ['aardbei', 'de aardbei', (() => {
    const body = 'M50 90C29 82 17 63 19 47C21 34 34 30 50 35C66 30 79 34 81 47C83 63 71 82 50 90Z';
    let seeds = '';
    [[32, 46], [68, 46], [28, 60], [72, 60], [38, 76], [62, 76], [50, 84], [50, 44]].forEach(([x, y]) => { seeds += `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="2.2" fill="#ffe9a0"/>`; });
    return sticker(`<path d="${body}"/><polygon points="${star(50, 32, 17, 7, 5, Math.PI)}"/><rect x="47" y="12" width="6" height="14" rx="3"/>`,
      `<path d="${body}" fill="#ff7b9c"/>${seeds}<polygon points="${star(50, 32, 17, 7, 5, Math.PI)}" fill="#8fdcb0" stroke="#8fdcb0" stroke-width="3" ${J}/><rect x="47.5" y="13" width="5" height="13" rx="2.5" fill="#7fcfa0"/>`
      + face(50, 60, 1.05));
  })()],

  ['koekje', 'het koekje', sticker(
    '<circle cx="50" cy="50" r="37"/>',
    `<path d="${wavy(50, 50, 35, 1.6, 9)}" fill="#ecbd7f"/><circle cx="50" cy="50" r="29" fill="#f3cb92"/>`
    + '<g fill="#8a5a3c"><circle cx="32" cy="34" r="4"/><circle cx="64" cy="30" r="3.5"/><circle cx="72" cy="58" r="4"/><circle cx="30" cy="64" r="3.5"/><circle cx="50" cy="76" r="3"/><circle cx="48" cy="28" r="2.5"/></g>'
    + face(50, 52, 1.1))],

  ['chocolade', 'de chocolade', sticker(
    '<rect x="28" y="12" width="44" height="76" rx="6" transform="rotate(-10 50 50)"/>',
    '<g transform="rotate(-10 50 50)"><rect x="28" y="12" width="44" height="76" rx="6" fill="#a8775a"/>'
    + '<g fill="#bd8c6c"><rect x="32" y="16" width="16" height="12" rx="2"/><rect x="52" y="16" width="16" height="12" rx="2"/><rect x="32" y="32" width="16" height="12" rx="2"/><rect x="52" y="32" width="16" height="12" rx="2"/></g>'
    + '<path d="M28 50L34 46L40 51L46 46L52 51L58 46L64 51L72 47V82Q72 88 66 88H34Q28 88 28 82Z" fill="#ff9ec7"/><rect x="28" y="62" width="44" height="12" fill="#fff3b0"/>'
    + `<path d="${HEART}" transform="translate(50 68) scale(.32)" fill="#ff6b8f"/></g>`
    + face(50, 80, 0.75))],
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
  page('snoep', 'Snoep', snoep),
  page('dieren', 'Dieren', dieren),
  page('ruimte', 'Ruimte', ruimte),
];

export const ACCESSORIES = [
  { id: 'kroon', name: 'de kroon', page: 'regenboog' },
  { id: 'bril', name: 'de bril', page: 'snoep' },
  { id: 'strik', name: 'de strik', page: 'dieren' },
  { id: 'vleugels', name: 'de vleugels', page: 'ruimte' },
];

const CROWN = 'M18 74L14 32L33 50L50 22L67 50L86 32L82 74Z';
const BOW_L = 'M50 48C40 30 16 26 14 42C12 58 34 64 50 52Z';
const BOW_R = 'M50 48C60 30 84 26 86 42C88 58 66 64 50 52Z';
const TAILS = 'M46 54L34 80L42 77L46 84L52 56ZM54 54L66 80L58 77L54 84L48 56Z';
const WING_UP = 'M0 0C-10-24-36-38-44-26C-50-14-32-2 0 0Z';
const WING_LO = 'M0 0C-22 0-38 10-34 20C-30 28-10 20 0 0Z';
const wing = (fill1, fill2) => `<path d="${WING_UP}"${fill1 ? ` fill="${fill1}"` : ''}/><path d="${WING_LO}"${fill2 ? ` fill="${fill2}"` : ''}/>`;
const wings = (a, b) => `<g transform="translate(48 52) scale(.84)">${wing(a, b)}</g><g transform="translate(52 52) scale(-.84 .84)">${wing(a, b)}</g>`;

export const ACCESSORY_ICONS = {
  kroon: sticker(
    `<path d="${CROWN}" stroke-width="13"/><circle cx="14" cy="30" r="5"/><circle cx="50" cy="20" r="5"/><circle cx="86" cy="30" r="5"/>`,
    `<path d="${CROWN}" fill="#ffd95e" stroke="#ffd95e" stroke-width="4" ${J}/><rect x="17" y="62" width="66" height="14" rx="4" fill="#f7c34d"/>`
    + '<g fill="#ffe9a0"><circle cx="14" cy="30" r="5"/><circle cx="50" cy="20" r="5"/><circle cx="86" cy="30" r="5"/></g>'
    + '<circle cx="32" cy="69" r="4" fill="#9be3c0"/><circle cx="68" cy="69" r="4" fill="#c8a8f0"/>'
    + `<path d="${HEART}" transform="translate(50 68) scale(.38)" fill="#ff6b9a"/><path d="M24 58L25.5 47" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`),

  bril: sticker(
    `<path d="${HEART}" transform="translate(30 50) scale(1.05)" stroke-width="15"/><path d="${HEART}" transform="translate(70 50) scale(1.05)" stroke-width="15"/>`,
    `<g stroke="#ff5fa8" stroke-width="4.5" ${J}><path d="M46 41Q50 37 54 41" fill="none"/>`
    + `<path d="${HEART}" transform="translate(30 50) scale(1.05)" fill="#ffd1e8" stroke-width="3.6"/><path d="${HEART}" transform="translate(70 50) scale(1.05)" fill="#ffd1e8" stroke-width="3.6"/></g>`
    + '<path d="M21 43Q23 38 27 37M61 43Q63 38 67 37" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'),

  strik: sticker(
    `<path d="${BOW_L}"/><path d="${BOW_R}"/><path d="${TAILS}"/>`,
    `<g fill="#ff8fbf" stroke="#ff8fbf" stroke-width="3" stroke-linejoin="round"><path d="${TAILS}"/><path d="${BOW_L}"/><path d="${BOW_R}"/></g>`
    + '<path d="M44 46C36 38 26 36 22 42M56 46C64 38 74 36 78 42" fill="none" stroke="#ff6fae" stroke-width="2.5" stroke-linecap="round"/>'
    + '<rect x="42" y="40" width="16" height="18" rx="7" fill="#ff6fae"/><circle cx="24" cy="38" r="2.5" fill="#fff" opacity=".7"/><circle cx="76" cy="38" r="2.5" fill="#fff" opacity=".7"/>'),

  vleugels: sticker(
    `<g stroke-width="11">${wings()}</g>`,
    `${wings('#d9c6fa', '#bdeedd')}<g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"><path d="M42 46Q34 38 24 35M58 46Q66 38 76 35"/></g>`
    + `${twinkle(50, 30, 6, '#ffd95e')}${twinkle(16, 72, 5, '#ff9ec7')}${twinkle(84, 72, 5, '#ff9ec7')}<circle cx="50" cy="52" r="4" fill="#ffb3d9"/>`),
};
