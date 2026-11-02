// A big friendly analogue clock for Klok lezen. Draw it once with clockSVG(),
// then move its hands with setClock(); they turn smoothly to the new time.

import { handAngles } from '../logic/clock.js';

const ticks = Array.from({ length: 60 }, (_, i) => {
  const hour = i % 5 === 0;
  return `<line x1="100" y1="${hour ? 18 : 19}" x2="100" y2="${hour ? 29 : 24}" stroke="${hour ? '#8b5cf6' : '#c4b5fd'}"
    stroke-width="${hour ? 3.5 : 1.5}" stroke-linecap="round" transform="rotate(${i * 6} 100 100)"/>`;
}).join('');

const numbers = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  const a = (n * 30 * Math.PI) / 180;
  const x = (100 + Math.sin(a) * 58).toFixed(1);
  const y = (100 - Math.cos(a) * 58).toFixed(1);
  return `<text x="${x}" y="${y}" dy="0.35em" text-anchor="middle">${n}</text>`;
}).join('');

export function clockSVG(time = { h: 12, m: 0 }) {
  const { hour, minute } = handAngles(time);
  return `<svg class="clock" viewBox="0 0 200 200" role="img" aria-label="Klok">
    <circle cx="100" cy="100" r="94" fill="#fbcfe8"/>
    <circle cx="100" cy="100" r="86" fill="white" stroke="#c4b5fd" stroke-width="4"/>
    ${ticks}
    <g class="clock-numbers" fill="#4c1d95" font-size="20" font-weight="700">${numbers}</g>
    <g class="hand hour-hand" style="transform-origin: 100px 100px; transform: rotate(${hour}deg)">
      <line x1="100" y1="108" x2="100" y2="58" stroke="#ec4899" stroke-width="10" stroke-linecap="round"/>
    </g>
    <g class="hand minute-hand" style="transform-origin: 100px 100px; transform: rotate(${minute}deg)">
      <line x1="100" y1="112" x2="100" y2="28" stroke="#8b5cf6" stroke-width="5" stroke-linecap="round"/>
    </g>
    <circle cx="100" cy="100" r="7" fill="#4c1d95"/>
  </svg>`;
}

// Hands only ever turn forwards, like a real clock.
const turned = new WeakMap();

export function setClock(svg, time) {
  const { hour, minute } = handAngles(time);
  const prev = turned.get(svg) ?? { hour: 0, minute: 0 };
  const forward = (from, to) => from + ((((to - from) % 360) + 360) % 360);
  const next = { hour: forward(prev.hour, hour), minute: forward(prev.minute, minute) };
  turned.set(svg, next);
  svg.querySelector('.hour-hand').style.transform = `rotate(${next.hour}deg)`;
  svg.querySelector('.minute-hand').style.transform = `rotate(${next.minute}deg)`;
}
