import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  denominationsFor, formatAmount, spokenAmount, fewestPieces, makeCountQuestion, makePayQuestion,
  makeMoneyQuestions, parseAmount, checkAmount, total,
} from '../js/logic/money.js';

// Small seeded generator so tests repeat.
function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

describe('denominationsFor', () => {
  test('whole euros up to the maximum', () => {
    assert.deepEqual(denominationsFor({ max: 20, cents: false }), [100, 200, 500, 1000, 2000]);
    assert.deepEqual(denominationsFor({ max: 10, cents: false }), [100, 200, 500, 1000]);
  });
  test('with cents, every coin', () => {
    assert.deepEqual(denominationsFor({ max: 100, cents: true }), [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]);
  });
});

describe('formatting', () => {
  test('shows and says amounts', () => {
    assert.equal(formatAmount(700), '€ 7');
    assert.equal(formatAmount(350), '€ 3,50');
    assert.equal(formatAmount(5), '€ 0,05');
    assert.equal(spokenAmount(700), '7 euro');
    assert.equal(spokenAmount(350), '3 euro 50');
    assert.equal(spokenAmount(20), '20 cent');
  });
  test('fewest pieces', () => {
    assert.deepEqual(fewestPieces(1700), [1000, 500, 200]);
    assert.deepEqual(fewestPieces(380, [10, 20, 50, 100, 200]), [200, 100, 50, 20, 10]);
  });
});

describe('questions', () => {
  for (const settings of [{ max: 10, cents: false }, { max: 20, cents: false }, { max: 100, cents: true }]) {
    test(`count questions fit the settings (${JSON.stringify(settings)})`, () => {
      const allowed = denominationsFor(settings);
      for (let seed = 1; seed < 300; seed++) {
        const q = makeCountQuestion(settings, seeded(seed));
        assert.ok(q.pieces.length >= 2 && q.pieces.length <= 6);
        assert.equal(q.answer, total(q.pieces));
        assert.ok(q.answer <= settings.max * 100);
        assert.ok(q.pieces.every((v) => allowed.includes(v)));
        assert.deepEqual(q.pieces, [...q.pieces].sort((a, b) => b - a));
      }
    });
    test(`pay questions can be paid from the tray (${JSON.stringify(settings)})`, () => {
      for (let seed = 1; seed < 300; seed++) {
        const q = makePayQuestion(settings, seeded(seed));
        assert.ok(q.answer >= 300 && q.answer <= settings.max * 100);
        assert.ok(!q.tray.includes(q.answer), 'needs more than one piece');
        assert.equal(q.answer % (settings.cents ? 10 : 100), 0);
        assert.ok(fewestPieces(q.answer, q.tray));
      }
    });
  }
  test('half of each kind, no amount twice in a row', () => {
    const qs = makeMoneyQuestions({ max: 20, cents: false }, 8, seeded(5));
    assert.equal(qs.filter((q) => q.kind === 'pay').length, 4);
    for (let i = 1; i < qs.length; i++) assert.notEqual(qs[i].answer, qs[i - 1].answer);
  });
});

describe('parseAmount', () => {
  test('understands spoken and typed amounts', () => {
    assert.equal(parseAmount('zeven'), 700);
    assert.equal(parseAmount('7'), 700);
    assert.equal(parseAmount('zeven euro'), 700);
    assert.equal(parseAmount('€ 12'), 1200);
    assert.equal(parseAmount('drie euro vijftig'), 350);
    assert.equal(parseAmount('3 euro 50'), 350);
    assert.equal(parseAmount('3,50'), 350);
    assert.equal(parseAmount('€3.5'), 350);
    assert.equal(parseAmount('vijftig cent'), 50);
    assert.equal(parseAmount('het is vijfentwintig euro'), 2500);
  });
  test('null when there is no amount', () => {
    assert.equal(parseAmount('geen idee'), null);
    assert.equal(parseAmount(''), null);
  });
  test('checkAmount accepts any alternative', () => {
    assert.deepEqual(checkAmount(700, ['zes', 'zeven']), { heard: 700, correct: true });
    assert.deepEqual(checkAmount(700, 'zes'), { heard: 600, correct: false });
  });
});
