// Question makers for the toddler games. Pure, with an optional rng for tests.

import { shuffle } from './words.js';

// Colour adjectives as used before a noun with "de"/"het": "de gele ster", "het rode rondje".
export const COLOURS = [
  { id: 'rood', adjective: 'rode', hex: '#f87171' },
  { id: 'blauw', adjective: 'blauwe', hex: '#60a5fa' },
  { id: 'geel', adjective: 'gele', hex: '#facc15' },
  { id: 'groen', adjective: 'groene', hex: '#4ade80' },
  { id: 'roze', adjective: 'roze', hex: '#f472b6' },
  { id: 'paars', adjective: 'paarse', hex: '#a78bfa' },
  { id: 'oranje', adjective: 'oranje', hex: '#fb923c' },
];

export const SHAPES = [
  { id: 'rondje', article: 'het' },
  { id: 'vierkantje', article: 'het' },
  { id: 'driehoekje', article: 'het' },
  { id: 'ster', article: 'de' },
  { id: 'hartje', article: 'het' },
];

const pick = (list, rng) => list[Math.floor(rng() * list.length)];

/** "Tik op de gele ster." */
export function shapePrompt(item) {
  const shape = SHAPES.find((s) => s.id === item.shape);
  const colour = COLOURS.find((c) => c.id === item.colour);
  return `Tik op ${shape.article} ${colour.adjective} ${shape.id}.`;
}

/**
 * One "tap the yellow star" question with `count` shapes. Only the target has
 * its exact shape and colour; when possible one other shape has the same
 * colour and another the same shape, so she has to look at both.
 * Returns { prompt, items: [{ shape, colour, target }] }.
 */
export function makeShapeQuestion(rng = Math.random, count = 4) {
  const target = { shape: pick(SHAPES, rng).id, colour: pick(COLOURS, rng).id };
  const key = (item) => `${item.shape}/${item.colour}`;
  const used = new Set([key(target)]);
  const items = [{ ...target, target: true }];
  const add = (item) => {
    if (used.has(key(item))) return false;
    used.add(key(item));
    items.push({ ...item, target: false });
    return true;
  };
  // Same colour, other shape; same shape, other colour.
  add({ shape: pick(SHAPES.filter((s) => s.id !== target.shape), rng).id, colour: target.colour });
  add({ shape: target.shape, colour: pick(COLOURS.filter((c) => c.id !== target.colour), rng).id });
  while (items.length < count) add({ shape: pick(SHAPES, rng).id, colour: pick(COLOURS, rng).id });
  return { prompt: shapePrompt(target), items: shuffle(items, rng) };
}

// Other first names for "Welke naam is van jou?".
export const OTHER_NAMES = [
  'Emma', 'Noor', 'Lotte', 'Mila', 'Lina', 'Nora', 'Fien', 'Ella', 'Roos', 'Sara',
  'Luna', 'Jules', 'Lars', 'Finn', 'Mats', 'Seppe', 'Wout', 'Lukas', 'Vic', 'Ines',
];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * The three steps of the name game for `name`:
 *  names:   her name and two others, shuffled
 *  first:   her first letter (uppercase) and three other letters, shuffled
 *  letters: the letters of her name in order, and the same letters shuffled as tiles
 * Returns null when there is no name.
 */
export function makeNameGame(name, rng = Math.random) {
  const clean = String(name ?? '').trim();
  if (!clean) return null;
  const letters = [...clean];
  const others = shuffle(OTHER_NAMES.filter((n) => n.toLowerCase() !== clean.toLowerCase()), rng).slice(0, 2);
  const first = letters[0].toUpperCase();
  const otherLetters = shuffle(ALPHABET.filter((l) => l !== first), rng).slice(0, 3);
  return {
    name: clean,
    names: shuffle([clean, ...others], rng),
    first,
    firstOptions: shuffle([first, ...otherLetters], rng),
    letters,
    tiles: shuffle(letters.map((letter, i) => ({ letter, id: i })), rng),
  };
}
