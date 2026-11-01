import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { matchCommand, matchCommandInAlternatives } from '../js/logic/commands.js';
import { shuffle, spokenForm, displayForm, buildRound } from '../js/logic/words.js';
import { makeQuestion, makeQuestions, parseNumber, checkAnswer } from '../js/logic/math.js';

// Small deterministic PRNG (mulberry32).
function seeded(seed = 1) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const data = JSON.parse(readFileSync(new URL('../data/woordpakketten.json', import.meta.url), 'utf8'));
const pakketten = data.pakketten;

describe('matchCommand', () => {
  const next = ['ja', 'Ja!', 'klaar', 'Klaar.', 'volgende', 'oké', 'Oké!', 'oke', 'OK', 'okay', 'okee',
    'oké dan', 'ja klaar!', 'jaja', 'ik ben klaar', 'ja, volgende', 'Ja?'];
  const repeat = ['wablieft?', 'Wablieft', 'wablief', 'wat?', 'Wat', 'zeg nog eens', 'zeg het nog eens',
    'nog eens', 'nog een keer', 'herhaal', 'Herhaal!', 'eh wat zei je'];
  const none = ['', '   ', 'jaar', 'watte', 'jas', 'klaarstaan', 'okapi', 'water', 'de man', 'nee',
    'volgend', 'eens', 'nog', 'herhaling', 'ik ben nog niet klaar', 'nee nog niet', 'niet klaar'];

  for (const t of next) test(`next: "${t}"`, () => assert.equal(matchCommand(t), 'next'));
  for (const t of repeat) test(`repeat: "${t}"`, () => assert.equal(matchCommand(t), 'repeat'));
  for (const t of none) test(`none: "${t}"`, () => assert.equal(matchCommand(t), null));

  test('repeat wins over next', () => {
    assert.equal(matchCommand('ja wat?'), 'repeat');
    assert.equal(matchCommand('oké zeg nog eens'), 'repeat');
  });
  test('handles null/undefined', () => {
    assert.equal(matchCommand(undefined), null);
    assert.equal(matchCommand(null), null);
  });
  test('alternatives: first non-null', () => {
    assert.equal(matchCommandInAlternatives(['jaar', 'ja']), 'next');
    assert.equal(matchCommandInAlternatives(['watte', 'wat', 'ja']), 'repeat');
    assert.equal(matchCommandInAlternatives(['jaar', 'water']), null);
    assert.equal(matchCommandInAlternatives([]), null);
  });
});

describe('words', () => {
  test('shuffle keeps elements and does not mutate', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...input];
    const out = shuffle(input, seeded(3));
    assert.deepEqual(input, copy);
    assert.notEqual(out, input);
    assert.deepEqual([...out].sort((a, b) => a - b), copy);
  });
  test('shuffle is deterministic with rng and actually shuffles', () => {
    const a = shuffle([...Array(20).keys()], seeded(7));
    const b = shuffle([...Array(20).keys()], seeded(7));
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, [...Array(20).keys()]);
  });
  test('shuffle of empty array', () => assert.deepEqual(shuffle([]), []));

  test('spokenForm', () => {
    assert.equal(spokenForm('het (de) snoep'), 'het snoep');
    assert.equal(spokenForm('  de   man '), 'de man');
    assert.equal(spokenForm('(de) snoep'), 'snoep');
    assert.equal(spokenForm('tien'), 'tien');
  });
  test('displayForm', () => {
    assert.equal(displayForm('het (de) snoep'), 'het (de) snoep');
    assert.equal(displayForm('  de   man '), 'de man');
  });

  test('data file has 26 packages of 20 words', () => {
    assert.equal(Object.keys(pakketten).length, 26);
    for (const words of Object.values(pakketten)) assert.equal(words.length, 20);
  });

  test('package mode: all words of the package, shuffled', () => {
    const round = buildRound(pakketten, { mode: 'package', packageId: 2 }, seeded(1));
    assert.equal(round.length, 20);
    assert.deepEqual(round.map((r) => r.word).sort(), [...pakketten['2']].sort());
    assert.ok(round.every((r) => r.packageId === 2));
    assert.notDeepEqual(round.map((r) => r.word), pakketten['2']);
    const snoep = round.find((r) => r.word === 'het (de) snoep');
    assert.equal(snoep.spoken, 'het snoep');
  });
  test('package mode accepts string id', () => {
    const round = buildRound(pakketten, { mode: 'package', packageId: '5' }, seeded(1));
    assert.equal(round.length, 20);
    assert.ok(round.every((r) => r.packageId === 5));
  });

  test('mixed mode with real data, enabled 1..7: 20 unique words from those packages', () => {
    const enabled = [1, 2, 3, 4, 5, 6, 7];
    for (let seed = 1; seed <= 25; seed++) {
      const round = buildRound(pakketten, { mode: 'mixed', enabled }, seeded(seed));
      assert.equal(round.length, 20);
      assert.equal(new Set(round.map((r) => r.spoken)).size, 20);
      for (const r of round) {
        assert.ok(enabled.includes(r.packageId));
        assert.ok(pakketten[r.packageId].includes(r.word));
      }
    }
  });
  test('mixed mode respects size', () => {
    const round = buildRound(pakketten, { mode: 'mixed', enabled: [1, 2], size: 5 }, seeded(2));
    assert.equal(round.length, 5);
  });
  test('mixed mode dedupes across packages and returns all if too few', () => {
    const p = { 1: ['de zee', 'tien', 'het (de) snoep'], 2: ['de zee', 'het snoep', 'ja'] };
    const round = buildRound(p, { mode: 'mixed', enabled: [1, 2], size: 20 }, seeded(4));
    assert.equal(round.length, 4);
    assert.deepEqual(round.map((r) => r.spoken).sort(), ['de zee', 'het snoep', 'ja', 'tien']);
  });
  test('mixed mode with nothing enabled gives empty round', () => {
    assert.deepEqual(buildRound(pakketten, { mode: 'mixed', enabled: [] }), []);
  });
  test('mixed mode is deterministic with rng', () => {
    const opts = { mode: 'mixed', enabled: [1, 2, 3, 4, 5, 6, 7] };
    assert.deepEqual(buildRound(pakketten, opts, seeded(9)), buildRound(pakketten, opts, seeded(9)));
  });
});

describe('makeQuestion', () => {
  const defaults = { max: 100, ops: { plus: true, min: true, maal: true }, tables: [1, 2, 3, 4, 5] };

  test('many random questions satisfy constraints', () => {
    const rng = seeded(11);
    const seen = new Set();
    for (let i = 0; i < 2000; i++) {
      const q = makeQuestion(defaults, rng);
      seen.add(q.op);
      assert.ok(Number.isInteger(q.a) && Number.isInteger(q.b));
      if (q.op === 'plus') {
        assert.ok(q.a >= 0 && q.b >= 0 && q.a + q.b <= 100);
        assert.ok(!(q.a === 0 && q.b === 0));
        assert.equal(q.answer, q.a + q.b);
        assert.equal(q.display, `${q.a} + ${q.b}`);
        assert.equal(q.spoken, `${q.a} plus ${q.b}`);
      } else if (q.op === 'min') {
        assert.ok(q.a <= 100 && q.answer >= 0);
        assert.equal(q.answer, q.a - q.b);
        assert.equal(q.display, `${q.a} − ${q.b}`);
        assert.equal(q.spoken, `${q.a} min ${q.b}`);
      } else {
        assert.equal(q.op, 'maal');
        assert.ok(
          ([1, 2, 3, 4, 5].includes(q.a) && q.b >= 1 && q.b <= 10) ||
          ([1, 2, 3, 4, 5].includes(q.b) && q.a >= 1 && q.a <= 10)
        );
        assert.equal(q.answer, q.a * q.b);
        assert.equal(q.display, `${q.a} × ${q.b}`);
        assert.equal(q.spoken, `${q.a} maal ${q.b}`);
      }
    }
    assert.deepEqual([...seen].sort(), ['maal', 'min', 'plus']);
  });

  test('only one op enabled', () => {
    const rng = seeded(5);
    for (let i = 0; i < 200; i++) {
      assert.equal(makeQuestion({ max: 20, ops: { min: true }, tables: [] }, rng).op, 'min');
    }
  });
  test('maal uses only selected tables, factor appears on either side', () => {
    const rng = seeded(6);
    let tableFirst = 0, tableSecond = 0;
    for (let i = 0; i < 500; i++) {
      const q = makeQuestion({ max: 100, ops: { maal: true }, tables: [7] }, rng);
      assert.ok(q.a === 7 || q.b === 7);
      if (q.a === 7) tableFirst++;
      if (q.b === 7) tableSecond++;
    }
    assert.ok(tableFirst > 0 && tableSecond > 0);
  });
  test('no op enabled falls back to plus', () => {
    const rng = seeded(8);
    for (let i = 0; i < 50; i++) {
      const q = makeQuestion({ max: 10, ops: { plus: false, min: false, maal: false } }, rng);
      assert.equal(q.op, 'plus');
      assert.ok(q.a + q.b <= 10);
    }
  });
  test('small max still works', () => {
    const rng = seeded(9);
    for (let i = 0; i < 100; i++) {
      const q = makeQuestion({ max: 1, ops: { plus: true, min: true } }, rng);
      assert.ok(q.answer >= 0 && q.answer <= 1);
    }
  });
  test('deterministic with rng', () => {
    assert.deepEqual(makeQuestion(defaults, seeded(3)), makeQuestion(defaults, seeded(3)));
  });
});

describe('makeQuestions', () => {
  test('count and no exact duplicates in a row', () => {
    const qs = makeQuestions({ max: 5, ops: { plus: true }, tables: [] }, 200, seeded(2));
    assert.equal(qs.length, 200);
    for (let i = 1; i < qs.length; i++) assert.notEqual(qs[i].display, qs[i - 1].display);
  });
  test('terminates when duplicates are unavoidable', () => {
    const qs = makeQuestions({ max: 1, ops: { min: true } }, 10, seeded(2));
    assert.equal(qs.length, 10);
  });
  test('zero count', () => assert.deepEqual(makeQuestions({}, 0), []));
});

describe('parseNumber', () => {
  const cases = {
    '17': 17, '45': 45, '0': 0, '100': 100, '1000': 1000, '1.000': 1000,
    'nul': 0, 'een': 1, 'één': 1, 'Eén': 1, 'twee': 2, 'drie': 3, 'vier': 4, 'vijf': 5, 'zes': 6,
    'zeven': 7, 'acht': 8, 'negen': 9, 'tien': 10, 'elf': 11, 'twaalf': 12,
    'dertien': 13, 'veertien': 14, 'vijftien': 15, 'zestien': 16, 'zeventien': 17,
    'achttien': 18, 'negentien': 19, 'twintig': 20, 'dertig': 30, 'veertig': 40,
    'vijftig': 50, 'zestig': 60, 'zeventig': 70, 'tachtig': 80, 'negentig': 90, 'honderd': 100,
    'vijfenveertig': 45, 'vijf en veertig': 45, 'eenentwintig': 21, 'éénentwintig': 21,
    'een en twintig': 21, 'drieëntwintig': 23, 'tweeëntwintig': 22, 'achtentachtig': 88,
    'negenennegentig': 99, 'achtendertig': 38,
    'honderdtwintig': 120, 'honderd twintig': 120, 'honderd en twee': 102, 'honderdentwee': 102,
    'honderdvijfenveertig': 145, 'tweehonderd': 200, 'twee honderd': 200,
    'driehonderdzesenvijftig': 356, 'negenhonderdnegenennegentig': 999, 'duizend': 1000,
    'het is 12': 12, 'uhm achttien': 18, 'is het 7?': 7, 'Achttien!': 18, 'eh acht.': 8,
    'het is acht': 8, 'tachtig!': 80, 'ik denk vijftien': 15, '12 of 13': 12, 'zeven of acht': 7,
    'twaalf en': 12, 'vijf en twee': 5, 'een vijf': 5, 'is het een 7': 7,
  };
  for (const [input, expected] of Object.entries(cases)) {
    test(`"${input}" -> ${expected}`, () => assert.equal(parseNumber(input), expected));
  }
  for (const input of ['', 'nee', 'wablieft', 'ik weet het niet', 'en', 'achten', 'tienen', 'honderdx']) {
    test(`"${input}" -> null`, () => assert.equal(parseNumber(input), null));
  }
  test('null/undefined input', () => {
    assert.equal(parseNumber(undefined), null);
    assert.equal(parseNumber(null), null);
  });
});

describe('checkAnswer', () => {
  const q = { a: 7, b: 5, op: 'plus', answer: 12 };
  test('string correct', () => assert.deepEqual(checkAnswer(q, 'twaalf'), { heard: 12, correct: true }));
  test('string wrong', () => assert.deepEqual(checkAnswer(q, 'dertien'), { heard: 13, correct: false }));
  test('nothing heard', () => assert.deepEqual(checkAnswer(q, 'uhm'), { heard: null, correct: false }));
  test('any alternative correct', () => {
    assert.deepEqual(checkAnswer(q, ['twee', 'twaalf', 'dertien']), { heard: 12, correct: true });
  });
  test('wrong alternatives: heard is first parsed', () => {
    assert.deepEqual(checkAnswer(q, ['hallo', 'elf', 'dertien']), { heard: 11, correct: false });
  });
  test('empty alternatives', () => assert.deepEqual(checkAnswer(q, []), { heard: null, correct: false }));
  test('zero answer', () => {
    assert.deepEqual(checkAnswer({ answer: 0 }, 'nul'), { heard: 0, correct: true });
  });
});
