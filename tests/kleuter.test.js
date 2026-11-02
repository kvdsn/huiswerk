import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { makeShapeQuestion, shapePrompt, makeNameGame, COLOURS, SHAPES } from '../js/logic/kleuter.js';

// Small seeded generator so tests repeat.
function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

describe('shapePrompt', () => {
  test('uses de/het and the inflected colour', () => {
    assert.equal(shapePrompt({ shape: 'ster', colour: 'geel' }), 'Tik op de gele ster.');
    assert.equal(shapePrompt({ shape: 'rondje', colour: 'rood' }), 'Tik op het rode rondje.');
    assert.equal(shapePrompt({ shape: 'hartje', colour: 'roze' }), 'Tik op het roze hartje.');
    assert.equal(shapePrompt({ shape: 'vierkantje', colour: 'oranje' }), 'Tik op het oranje vierkantje.');
  });
});

describe('makeShapeQuestion', () => {
  test('exactly one target, all shapes different, valid ids, 4 items', () => {
    for (let seed = 1; seed < 200; seed++) {
      const q = makeShapeQuestion(seeded(seed));
      assert.equal(q.items.length, 4);
      assert.equal(q.items.filter((i) => i.target).length, 1);
      assert.equal(new Set(q.items.map((i) => `${i.shape}/${i.colour}`)).size, 4);
      for (const i of q.items) {
        assert.ok(SHAPES.some((s) => s.id === i.shape));
        assert.ok(COLOURS.some((c) => c.id === i.colour));
      }
      const target = q.items.find((i) => i.target);
      assert.equal(q.prompt, shapePrompt(target));
      // One look-alike in colour and one in shape.
      assert.ok(q.items.some((i) => !i.target && i.colour === target.colour));
      assert.ok(q.items.some((i) => !i.target && i.shape === target.shape));
    }
  });
});

describe('makeNameGame', () => {
  test('no name, no game', () => {
    assert.equal(makeNameGame(''), null);
    assert.equal(makeNameGame('   '), null);
    assert.equal(makeNameGame(undefined), null);
  });

  test('builds the three steps from the name', () => {
    const game = makeNameGame(' Noor ', seeded(3));
    assert.equal(game.name, 'Noor');
    assert.equal(game.names.length, 3);
    assert.ok(game.names.includes('Noor'));
    assert.equal(game.names.filter((n) => n.toLowerCase() === 'noor').length, 1);
    assert.equal(game.first, 'N');
    assert.equal(game.firstOptions.length, 4);
    assert.equal(new Set(game.firstOptions).size, 4);
    assert.ok(game.firstOptions.includes('N'));
    assert.deepEqual(game.letters, ['N', 'o', 'o', 'r']);
    assert.deepEqual(game.tiles.map((t) => t.letter).sort(), ['N', 'o', 'o', 'r'].sort());
    assert.deepEqual(game.tiles.map((t) => t.id).sort(), [0, 1, 2, 3]);
  });

  test('a lowercase name still asks for a capital first letter', () => {
    assert.equal(makeNameGame('liv', seeded(1)).first, 'L');
  });
});
