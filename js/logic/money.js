// Money: counting coins and notes, and paying an amount. All amounts are in
// cents. Pure, with an optional rng for tests.
//   settings = { max: 10 | 20 | 50 | 100 (euro), cents: boolean }

import { normalize } from './commands.js';
import { parseNumber } from './math.js';
import { shuffle } from './words.js';

// Every euro coin and note up to 100 euro.
export const DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
export const isNote = (value) => value >= 500;

const MAX_PIECES = 6;
const randInt = (min, max, rng) => min + Math.floor(rng() * (max - min + 1));

/** The coins and notes that fit the settings, smallest first. */
export function denominationsFor(settings = {}) {
  const max = (settings.max ?? 20) * 100;
  return DENOMINATIONS.filter((v) => v <= max && (settings.cents || v >= 100));
}

export const total = (pieces) => pieces.reduce((sum, v) => sum + v, 0);

/** "€ 7", "€ 3,50", "€ 0,20". */
export function formatAmount(cents) {
  const euro = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest ? `€ ${euro},${String(rest).padStart(2, '0')}` : `€ ${euro}`;
}

/** "7 euro", "3 euro 50", "20 cent". */
export function spokenAmount(cents) {
  const euro = Math.floor(cents / 100);
  const rest = cents % 100;
  if (!rest) return `${euro} euro`;
  return euro ? `${euro} euro ${rest}` : `${rest} cent`;
}

/** Fewest pieces that make the amount, largest first. */
export function fewestPieces(cents, denominations = DENOMINATIONS) {
  const pieces = [];
  let left = cents;
  for (const v of [...denominations].sort((a, b) => b - a)) {
    while (left >= v) {
      pieces.push(v);
      left -= v;
    }
  }
  return left ? null : pieces;
}

/** "Hoeveel is het?": 2–6 pieces, largest first, adding up to at most the maximum. */
export function makeCountQuestion(settings = {}, rng = Math.random) {
  const max = (settings.max ?? 20) * 100;
  const denominations = denominationsFor(settings);
  const count = randInt(2, MAX_PIECES, rng);
  const pieces = [];
  while (pieces.length < count) {
    // Leave room for the pieces still to come.
    const room = max - total(pieces) - (count - pieces.length - 1) * denominations[0];
    const fits = denominations.filter((v) => v <= room);
    if (!fits.length) break;
    pieces.push(fits[Math.floor(rng() * fits.length)]);
  }
  pieces.sort((a, b) => b - a);
  return { kind: 'count', pieces, answer: total(pieces) };
}

/**
 * "Betaal …": an amount from 3 euro up to the maximum, in whole euros or tens of
 * cents, that needs more than one coin or note.
 */
export function makePayQuestion(settings = {}, rng = Math.random) {
  const max = (settings.max ?? 20) * 100;
  const step = settings.cents ? 10 : 100;
  const tray = denominationsFor(settings);
  let answer;
  do answer = randInt(300 / step, max / step, rng) * step;
  while (tray.includes(answer));
  return { kind: 'pay', answer, tray };
}

/** `count` questions, half of each kind, mixed, never the same amount twice in a row. */
export function makeMoneyQuestions(settings, count, rng = Math.random) {
  const kinds = shuffle(Array.from({ length: count }, (_, i) => (i % 2 ? 'pay' : 'count')), rng);
  const out = [];
  for (const kind of kinds) {
    const make = kind === 'pay' ? makePayQuestion : makeCountQuestion;
    let q = make(settings, rng);
    for (let tries = 0; tries < 20 && out.length && q.answer === out[out.length - 1].answer; tries++) q = make(settings, rng);
    out.push(q);
  }
  return out;
}

/** The amount in what the child said or typed ("drie euro vijftig", "3,50", "50 cent", "7"), or null. */
export function parseAmount(transcript) {
  const raw = String(transcript ?? '');
  const decimal = raw.match(/(\d+)[,.](\d{1,2})\b/);
  if (decimal) return Number(decimal[1]) * 100 + Number(decimal[2].padEnd(2, '0'));
  const text = normalize(raw);
  const euro = text.match(/^(.*?)\beuro\b(.*)$/);
  if (euro) {
    const whole = parseNumber(euro[1]);
    if (whole === null) return null;
    const rest = parseNumber(euro[2]);
    return whole * 100 + (rest !== null && rest < 100 ? rest : 0);
  }
  const cent = text.match(/^(.*?)\bcent\b/);
  if (cent) {
    const n = parseNumber(cent[1]);
    return n === null ? null : n;
  }
  const n = parseNumber(text);
  return n === null ? null : n * 100;
}

/** Check a spoken or typed amount (string or list of alternatives), like checkAnswer in math.js. */
export function checkAmount(answer, transcriptOrAlternatives) {
  const list = Array.isArray(transcriptOrAlternatives) ? transcriptOrAlternatives : [transcriptOrAlternatives];
  const parsed = list.map(parseAmount).filter((n) => n !== null);
  const correct = parsed.includes(answer);
  return { heard: correct ? answer : parsed[0] ?? null, correct };
}
