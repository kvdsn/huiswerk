import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  timeWords, handAngles, makeClockQuestion, makeClockQuestions, parseTime, checkTime, sameTime, CLOCK_KINDS,
} from '../js/logic/clock.js';

// Small seeded generator so tests repeat.
function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

describe('timeWords', () => {
  test('says times the Flemish way', () => {
    assert.equal(timeWords({ h: 4, m: 0 }), 'vier uur');
    assert.equal(timeWords({ h: 4, m: 15 }), 'kwart na vier');
    assert.equal(timeWords({ h: 4, m: 30 }), 'half vijf');
    assert.equal(timeWords({ h: 4, m: 45 }), 'kwart voor vijf');
    assert.equal(timeWords({ h: 12, m: 30 }), 'half één');
    assert.equal(timeWords({ h: 11, m: 45 }), 'kwart voor twaalf');
    assert.equal(timeWords({ h: 1, m: 0 }), 'één uur');
  });
});

describe('handAngles', () => {
  test('the hour hand moves on between the hours', () => {
    assert.deepEqual(handAngles({ h: 3, m: 0 }), { hour: 90, minute: 0 });
    assert.deepEqual(handAngles({ h: 4, m: 30 }), { hour: 135, minute: 180 });
    assert.deepEqual(handAngles({ h: 12, m: 45 }), { hour: 22.5, minute: 270 });
  });
});

describe('makeClockQuestion', () => {
  const all = Object.keys(CLOCK_KINDS);
  for (const kinds of [['heel'], ['half'], ['kwart'], ['heel', 'half'], all]) {
    test(`three different answers, only allowed minutes (${kinds})`, () => {
      const minutes = kinds.flatMap((k) => CLOCK_KINDS[k]);
      for (let seed = 1; seed < 300; seed++) {
        const q = makeClockQuestion(kinds, seeded(seed));
        assert.equal(q.options.length, 3);
        assert.equal(new Set(q.options.map(timeWords)).size, 3);
        assert.equal(q.options.filter((t) => sameTime(t, q.answer)).length, 1);
        for (const t of q.options) {
          assert.ok(t.h >= 1 && t.h <= 12);
          assert.ok(minutes.includes(t.m), `${timeWords(t)} not allowed`);
        }
      }
    });
  }

  test('half past offers the hour read the wrong way round', () => {
    for (let seed = 1; seed < 100; seed++) {
      const q = makeClockQuestion(['half'], seeded(seed));
      const wrongWay = { h: q.answer.h === 1 ? 12 : q.answer.h - 1, m: 30 };
      assert.ok(q.options.some((t) => sameTime(t, wrongWay)));
    }
  });

  test('no time twice in a row', () => {
    const qs = makeClockQuestions(['heel'], 50, seeded(3));
    assert.equal(qs.length, 50);
    for (let i = 1; i < qs.length; i++) assert.ok(!sameTime(qs[i].answer, qs[i - 1].answer));
  });
});

describe('parseTime', () => {
  test('understands words and digits', () => {
    assert.deepEqual(parseTime('half vijf'), { h: 4, m: 30 });
    assert.deepEqual(parseTime('Het is half 5.'), { h: 4, m: 30 });
    assert.deepEqual(parseTime('kwart na drie'), { h: 3, m: 15 });
    assert.deepEqual(parseTime('kwart voor één'), { h: 12, m: 45 });
    assert.deepEqual(parseTime('vier uur'), { h: 4, m: 0 });
    assert.deepEqual(parseTime('16 uur'), { h: 4, m: 0 });
    assert.deepEqual(parseTime('4:30'), { h: 4, m: 30 });
    assert.deepEqual(parseTime('half twaalf'), { h: 11, m: 30 });
    assert.deepEqual(parseTime('een uur'), { h: 1, m: 0 });
  });

  test('null when there is no time', () => {
    assert.equal(parseTime('ik weet het niet'), null);
    assert.equal(parseTime(''), null);
    assert.equal(parseTime('half'), null);
  });
});

describe('checkTime', () => {
  test('accepts any alternative', () => {
    const answer = { h: 4, m: 30 };
    assert.deepEqual(checkTime(answer, ['half vier', 'half vijf']), { heard: answer, correct: true });
    assert.deepEqual(checkTime(answer, 'half vier'), { heard: { h: 3, m: 30 }, correct: false });
    assert.deepEqual(checkTime(answer, 'hallo'), { heard: null, correct: false });
  });
});
