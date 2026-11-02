// Euro coins and notes for the Geld game: simple, friendly pictures in the
// real colours with the value written big, not lifelike copies of real money.
// Every piece is a self-contained <svg> string; no ids, so one can appear many times.

import { isNote } from '../logic/money.js';

// Coin sizes relative to the 2 euro coin (25.75 mm), so they feel like the real ones.
const COIN_MM = { 1: 16.25, 2: 18.75, 5: 21.25, 10: 19.75, 20: 22.25, 50: 24.25, 100: 23.25, 200: 25.75 };

const COPPER = { fill: '#e7a273', rim: '#b8693a', ink: '#7c3a12' };
const GOLD = { fill: '#f6d36b', rim: '#c9a227', ink: '#7a5a00' };
const SILVER = { fill: '#e5e7eb', rim: '#9ca3af', ink: '#374151' };

const NOTES = {
  500: { fill: '#d1d5db', deep: '#6b7280' },
  1000: { fill: '#fca5a5', deep: '#dc2626' },
  2000: { fill: '#93c5fd', deep: '#2563eb' },
  5000: { fill: '#fdba74', deep: '#ea580c' },
  10000: { fill: '#86efac', deep: '#16a34a' },
};

/** Size of a piece relative to a 2 euro coin (notes are wider). */
export const pieceScale = (value) => (isNote(value) ? 1 : COIN_MM[value] / COIN_MM[200]);

function coin(value) {
  const euro = value >= 100;
  const label = euro ? value / 100 : value;
  // 1 euro: silver middle in a gold ring; 2 euro: the other way round.
  const [ring, middle] = value === 100 ? [GOLD, SILVER] : value === 200 ? [SILVER, GOLD] : value < 10 ? [COPPER, COPPER] : [GOLD, GOLD];
  return `<svg class="coin" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="${ring.fill}" stroke="${ring.rim}" stroke-width="3"/>
    <circle cx="50" cy="50" r="${euro ? 33 : 39}" fill="${middle.fill}" stroke="${ring.rim}" stroke-width="${euro ? 2 : 1.2}" stroke-dasharray="${euro ? 'none' : '3 3'}"/>
    <text x="50" y="54" text-anchor="middle" font-size="${String(label).length > 1 ? 38 : 46}" font-weight="700" fill="${middle.ink}">${label}</text>
    <text x="50" y="75" text-anchor="middle" font-size="14" font-weight="600" fill="${middle.ink}">${euro ? 'euro' : 'cent'}</text>
  </svg>`;
}

function note(value) {
  const { fill, deep } = NOTES[value];
  const label = value / 100;
  return `<svg class="note-bill" viewBox="0 0 160 84">
    <rect x="2" y="2" width="156" height="80" rx="9" fill="${fill}" stroke="${deep}" stroke-width="3"/>
    <rect x="9" y="9" width="142" height="66" rx="5" fill="white" fill-opacity=".35"/>
    <path d="M100 66 V40 a18 18 0 0 1 36 0 V66" fill="none" stroke="${deep}" stroke-width="3" stroke-opacity=".5"/>
    <path d="M108 66 V44 a10 10 0 0 1 20 0 V66" fill="none" stroke="${deep}" stroke-width="2" stroke-opacity=".4"/>
    <text x="54" y="56" text-anchor="middle" font-size="${label >= 100 ? 36 : 42}" font-weight="700" fill="${deep}">${label}</text>
    <text x="54" y="72" text-anchor="middle" font-size="12" font-weight="700" fill="${deep}" letter-spacing="2">EURO</text>
    <text x="16" y="25" font-size="15" font-weight="700" fill="${deep}">${label}</text>
  </svg>`;
}

export function moneySVG(value) {
  return isNote(value) ? note(value) : coin(value);
}
