// Math questions and spoken-answer parsing.

const randInt = (min, max, rng) => min + Math.floor(rng() * (max - min + 1));
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

const SYMBOL = { plus: '+', min: '−', maal: '×' };

function build(a, b, op) {
  const answer = op === 'plus' ? a + b : op === 'min' ? a - b : a * b;
  return { a, b, op, display: `${a} ${SYMBOL[op]} ${b}`, spoken: `${a} ${op} ${b}`, answer };
}

// One random question for the given settings.
export function makeQuestion(settings = {}, rng = Math.random) {
  const max = Math.max(1, settings.max ?? 100);
  const ops = ['plus', 'min', 'maal'].filter((o) => settings.ops?.[o]);
  const op = ops.length ? pick(ops, rng) : 'plus';

  if (op === 'plus') {
    let a, b;
    do {
      a = randInt(0, max, rng);
      b = randInt(0, max - a, rng);
    } while (a === 0 && b === 0);
    return build(a, b, op);
  }
  if (op === 'min') {
    let a, b;
    do {
      a = randInt(0, max, rng);
      b = randInt(0, a, rng);
    } while (a === 0); // avoid trivial 0 − 0
    return build(a, b, op);
  }
  const tables = settings.tables?.length ? settings.tables : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const t = pick(tables, rng);
  const other = randInt(1, 10, rng);
  return rng() < 0.5 ? build(t, other, op) : build(other, t, op);
}

// `count` questions, avoiding the same question twice in a row where possible.
export function makeQuestions(settings, count, rng = Math.random) {
  const out = [];
  for (let i = 0; i < count; i++) {
    let q = makeQuestion(settings, rng);
    for (let tries = 0; tries < 20 && out.length && q.display === out[out.length - 1].display; tries++) {
      q = makeQuestion(settings, rng);
    }
    out.push(q);
  }
  return out;
}

// ---- Number parsing ----

const UNITS = { nul: 0, een: 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9 };
const TEENS = {
  tien: 10, elf: 11, twaalf: 12, dertien: 13, veertien: 14, vijftien: 15,
  zestien: 16, zeventien: 17, achttien: 18, negentien: 19,
};
const TENS = {
  twintig: 20, dertig: 30, veertig: 40, vijftig: 50,
  zestig: 60, zeventig: 70, tachtig: 80, negentig: 90,
};
const SIMPLE = { ...UNITS, ...TEENS, ...TENS };

// 0..99 as one (already concatenated) word, e.g. "vijfenveertig".
function below100(s) {
  if (s in SIMPLE) return SIMPLE[s];
  const m = s.match(/^(een|twee|drie|vier|vijf|zes|zeven|acht|negen)en(\w+)$/);
  if (m && m[2] in TENS) return UNITS[m[1]] + TENS[m[2]];
  return null;
}

// 0..1000 as one word: "tweehonderd", "honderdentwee", "honderdvijfenveertig", "duizend".
function parseWord(s) {
  if (s === 'duizend' || s === 'eenduizend') return 1000;
  const m = s.match(/^(\w*?)honderd(?:en)?(\w*)$/);
  if (m) {
    const mult = m[1] === '' ? 1 : UNITS[m[1]];
    if (!mult) return null;
    if (m[2] === '') return mult * 100;
    const rest = below100(m[2]);
    return rest === null ? null : mult * 100 + rest;
  }
  return below100(s);
}

// Lowercase, strip accents (één -> een, drieën -> drieen), drop punctuation.
function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/(\d)\.(?=\d{3}\b)/g, '$1') // "1.000" -> "1000"
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

const isNumWord = (t) => parseWord(t) !== null || t === 'honderd';

// Longest run of tokens starting at i that concatenates to a valid number ("vijf en veertig").
function readNumberAt(tokens, i) {
  let best = null;
  let joined = '';
  for (let j = i; j < tokens.length && j < i + 5; j++) {
    const t = tokens[j];
    if (t !== 'en' && !isNumWord(t)) break;
    joined += t;
    const v = parseWord(joined);
    if (v !== null) best = { value: v, end: j };
  }
  return best;
}

// First number in a transcript (digits or Dutch words), or null.
export function parseNumber(transcript) {
  const tokens = tokenize(transcript);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    if (t === 'en') continue;
    const r = readNumberAt(tokens, i);
    if (!r) continue;
    // "een" is often the article ("een vijf"): prefer the number right after it.
    const next = tokens[r.end + 1];
    if (t === 'een' && r.end === i && next && (/^\d+$/.test(next) || isNumWord(next))) continue;
    return r.value;
  }
  return null;
}

// Check a spoken answer (string or list of alternatives).
export function checkAnswer(question, transcriptOrAlternatives) {
  const list = Array.isArray(transcriptOrAlternatives) ? transcriptOrAlternatives : [transcriptOrAlternatives];
  const parsed = list.map(parseNumber).filter((n) => n !== null);
  const correct = parsed.includes(question.answer);
  return { heard: correct ? question.answer : parsed[0] ?? null, correct };
}
