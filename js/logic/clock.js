// Telling the time: times on an analogue clock, said the Flemish way.
//   time = { h: 1..12, m: 0 | 15 | 30 | 45 }   (h is the hour the hour hand has passed)
// Pure, with an optional rng for tests.

import { normalize } from './commands.js';
import { parseNumber } from './math.js';
import { shuffle } from './words.js';

const HOURS = ['twaalf', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf'];

// Which minutes each setting allows.
export const CLOCK_KINDS = { heel: [0], half: [30], kwart: [15, 45] };

/** Any whole number to 1..12 ("13" -> 1, "0" -> 12). */
const wrap = (h) => ((((h - 1) % 12) + 12) % 12) + 1;
const time = (h, m) => ({ h: wrap(h), m });

export const sameTime = (a, b) => a.h === b.h && a.m === b.m;

/** "vier uur", "half vijf", "kwart na vier", "kwart voor vijf". */
export function timeWords({ h, m }) {
  if (m === 0) return `${HOURS[h]} uur`;
  if (m === 15) return `kwart na ${HOURS[h]}`;
  if (m === 30) return `half ${HOURS[wrap(h + 1)]}`;
  return `kwart voor ${HOURS[wrap(h + 1)]}`;
}

/** Hand angles in degrees, clockwise from 12. The hour hand moves on between the hours. */
export function handAngles({ h, m }) {
  return { hour: (h % 12) * 30 + m / 2, minute: m * 6 };
}

const minutesFor = (kinds) => {
  const list = (kinds?.length ? kinds : ['heel']).flatMap((k) => CLOCK_KINDS[k] ?? []);
  return list.length ? list : [0];
};

// Wrong answers that make the child look at both hands, most tempting first.
function lookalikes({ h, m }) {
  if (m === 0) return [time(h - 1, 0), time(h + 1, 0), time(h - 1, 30), time(h, 30)];
  // half vijf (4:30): "half vier" reads the hour hand the wrong way round.
  if (m === 30) return [time(h - 1, 30), time(h, 0), time(h + 1, 0), time(h + 1, 30)];
  // kwart na vier vs kwart voor vier: the minute hand on the wrong side.
  if (m === 15) return [time(h - 1, 45), time(h + 1, 15), time(h - 1, 15), time(h, 30)];
  return [time(h + 1, 15), time(h - 1, 45), time(h + 1, 45), time(h, 30)];
}

/** One question: the time on the clock and three different answers in random order. */
export function makeClockQuestion(kinds, rng = Math.random) {
  const minutes = minutesFor(kinds);
  const answer = time(1 + Math.floor(rng() * 12), minutes[Math.floor(rng() * minutes.length)]);
  const allowed = lookalikes(answer).filter((t) => minutes.includes(t.m));
  const [first, ...rest] = allowed;
  const wrong = first ? [first, ...shuffle(rest, rng)] : [];
  // With only hele uren there may be too few lookalikes: any other hour will do.
  for (let d = 2; wrong.length < 2; d++) wrong.push(time(answer.h + (d % 2 ? -d : d), answer.m));
  return { answer, options: shuffle([answer, ...wrong.slice(0, 2)], rng) };
}

/** `count` questions, never the same time twice in a row. */
export function makeClockQuestions(kinds, count, rng = Math.random) {
  const out = [];
  while (out.length < count) {
    const q = makeClockQuestion(kinds, rng);
    if (!out.length || !sameTime(q.answer, out[out.length - 1].answer)) out.push(q);
  }
  return out;
}

const hourOf = (word) => {
  const n = parseNumber(word);
  return n === null || n < 0 || n > 24 ? null : n;
};

/** The time in what the child said ("het is half vijf", "kwart voor 3", "4:30"), or null. */
export function parseTime(transcript) {
  const digital = String(transcript ?? '').match(/\b(\d{1,2})[:.u](\d{2})\b/);
  if (digital && [0, 15, 30, 45].includes(Number(digital[2]))) return time(Number(digital[1]), Number(digital[2]));
  const text = normalize(transcript);
  const patterns = [
    [/\bkwart na (\S+)/, (n) => time(n, 15)],
    [/\bkwart voor (\S+)/, (n) => time(n - 1, 45)],
    [/\bhalf (\S+)/, (n) => time(n - 1, 30)],
    [/(\S+) uur\b/, (n) => time(n, 0)],
  ];
  for (const [re, make] of patterns) {
    const match = text.match(re);
    const n = match && hourOf(match[1]);
    if (n !== null && n !== undefined) return make(n);
  }
  return null;
}

/** Check a spoken answer (string or list of alternatives), like checkAnswer in math.js. */
export function checkTime(answer, transcriptOrAlternatives) {
  const list = Array.isArray(transcriptOrAlternatives) ? transcriptOrAlternatives : [transcriptOrAlternatives];
  const parsed = list.map(parseTime).filter(Boolean);
  const correct = parsed.some((t) => sameTime(t, answer));
  return { heard: correct ? answer : parsed[0] ?? null, correct };
}
