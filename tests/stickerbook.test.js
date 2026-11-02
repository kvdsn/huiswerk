import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyBook, isPageComplete, currentPage, award, unlockedAccessories, toggleWorn, cleanBook, carryOverPage,
} from '../js/logic/stickerbook.js';

const page = (id, n) => ({ id, stickers: Array.from({ length: n }, (_, i) => ({ id: `${id}-${i}` })) });
const pages = [page('a', 3), page('b', 2)];
const accessories = [{ id: 'kroon', page: 'a' }, { id: 'bril', page: 'b' }];

// Deterministic "random": always the first option.
const first = () => 0;

function fill(book, n, opts) {
  let b = book;
  for (let i = 0; i < n; i++) b = award(b, pages, opts, first).book;
  return b;
}

describe('award', () => {
  test('gives a sticker from the first page that is not full', () => {
    const { book, sticker, completedPage } = award(emptyBook(), pages, {}, first);
    assert.deepEqual(sticker, { id: 'a-0', pageId: 'a', glitter: false });
    assert.equal(completedPage, null);
    assert.deepEqual(book.stickers, { 'a-0': { glitter: false } });
  });

  test('never repeats a sticker and reports the page it completes', () => {
    let book = emptyBook();
    const got = [];
    let completed = [];
    for (let i = 0; i < 5; i++) {
      const r = award(book, pages, {}, Math.random);
      book = r.book;
      got.push(r.sticker.id);
      if (r.completedPage) completed.push(r.completedPage);
    }
    assert.equal(new Set(got).size, 5);
    assert.deepEqual(got.slice(0, 3).sort(), ['a-0', 'a-1', 'a-2']);
    assert.deepEqual(completed, ['a', 'b']);
  });

  test('a perfect round gives glitter', () => {
    const { sticker } = award(emptyBook(), pages, { glitter: true }, first);
    assert.equal(sticker.glitter, true);
  });

  test('full album: perfect round upgrades a plain sticker, otherwise nothing', () => {
    const full = fill(emptyBook(), 5);
    assert.equal(currentPage(full, pages), null);
    assert.equal(award(full, pages, {}, first).sticker, null);
    const r = award(full, pages, { glitter: true }, first);
    assert.deepEqual(r.sticker, { id: 'a-0', pageId: 'a', glitter: true });
    assert.equal(r.book.stickers['a-0'].glitter, true);
    const allGlitter = fill(emptyBook(), 5, { glitter: true });
    assert.equal(award(allGlitter, pages, { glitter: true }, first).sticker, null);
  });

  test('does not change the book it was given', () => {
    const book = emptyBook();
    award(book, pages, {}, first);
    assert.deepEqual(book, emptyBook());
  });
});

describe('accessories', () => {
  test('a full page unlocks its accessory', () => {
    assert.deepEqual(unlockedAccessories(emptyBook(), pages, accessories), []);
    const book = fill(emptyBook(), 3);
    assert.equal(isPageComplete(book, pages[0]), true);
    assert.deepEqual(unlockedAccessories(book, pages, accessories), ['kroon']);
  });

  test('only unlocked accessories can be worn, and toggling takes them off', () => {
    const book = fill(emptyBook(), 3);
    assert.deepEqual(toggleWorn(book, 'bril', pages, accessories).worn, []);
    const on = toggleWorn(book, 'kroon', pages, accessories);
    assert.deepEqual(on.worn, ['kroon']);
    assert.deepEqual(toggleWorn(on, 'kroon', pages, accessories).worn, []);
  });
});

describe('cleanBook', () => {
  test('drops unknown stickers and locked accessories, survives junk', () => {
    const stored = { stickers: { 'a-0': { glitter: 1 }, 'zzz': { glitter: false } }, worn: ['kroon', 'bril'] };
    assert.deepEqual(cleanBook(stored, pages, accessories), { stickers: { 'a-0': { glitter: true } }, worn: [] });
    assert.deepEqual(cleanBook(null, pages, accessories), emptyBook());
    assert.deepEqual(cleanBook('rubbish', pages, accessories), emptyBook());
  });

  test('keeps a worn accessory whose page is full', () => {
    const book = fill(emptyBook(), 3);
    assert.deepEqual(cleanBook({ ...book, worn: ['kroon'] }, pages, accessories).worn, ['kroon']);
  });
});

describe('carryOverPage', () => {
  const zee = page('zee', 3);

  test('moves earned stickers of a replaced page to the new one, keeping glitter', () => {
    const stored = { stickers: { 'snoep-x': { glitter: true }, 'snoep-y': { glitter: false }, 'a-0': { glitter: false } }, worn: ['bril'] };
    assert.deepEqual(carryOverPage(stored, 'snoep', zee), {
      stickers: { 'a-0': { glitter: false }, 'zee-0': { glitter: true }, 'zee-1': { glitter: false } },
      worn: ['bril'],
    });
  });

  test('a full old page fills the new page, so its accessory stays unlocked', () => {
    const stored = { stickers: { 'snoep-1': {}, 'snoep-2': {}, 'snoep-3': {} }, worn: [] };
    const moved = carryOverPage(stored, 'snoep', zee);
    assert.equal(isPageComplete(moved, zee), true);
  });

  test('leaves data without old stickers untouched', () => {
    const stored = { stickers: { 'a-0': { glitter: false } }, worn: [] };
    assert.equal(carryOverPage(stored, 'snoep', zee), stored);
    assert.equal(carryOverPage(null, 'snoep', zee), null);
  });
});
