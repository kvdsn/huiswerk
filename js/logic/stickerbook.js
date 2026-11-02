// Sticker book rules. Pure functions on a plain "book" object, so they can be
// tested without a browser:
//   book = { stickers: { [stickerId]: { glitter: boolean } }, worn: [accessoryId] }
//   pages = [{ id, stickers: [{ id }] }]
//   accessories = [{ id, page }]   (a full page unlocks its accessory)

export function emptyBook() {
  return { stickers: {}, worn: [] };
}

export function isPageComplete(book, page) {
  return page.stickers.every((sticker) => book.stickers[sticker.id]);
}

/** The first page that isn't full yet, or null when the album is complete. */
export function currentPage(book, pages) {
  return pages.find((page) => !isPageComplete(book, page)) || null;
}

/**
 * Gives one sticker for a finished round: a random missing sticker from the
 * current page, so every sticker brings the next accessory closer. A perfect
 * round makes it a glitter sticker. With a full album, a perfect round turns
 * a plain sticker into glitter instead.
 *
 * Returns { book, sticker: { id, pageId, glitter } | null, completedPage: pageId | null }.
 */
export function award(book, pages, { glitter = false } = {}, rng = Math.random) {
  const page = currentPage(book, pages);
  if (!page) {
    const plain = pages.flatMap((p) => p.stickers.map((s) => ({ id: s.id, pageId: p.id })))
      .filter((s) => !book.stickers[s.id].glitter);
    if (!glitter || !plain.length) return { book, sticker: null, completedPage: null };
    const pick = plain[Math.floor(rng() * plain.length)];
    const next = { ...book, stickers: { ...book.stickers, [pick.id]: { glitter: true } } };
    return { book: next, sticker: { ...pick, glitter: true }, completedPage: null };
  }
  const missing = page.stickers.filter((s) => !book.stickers[s.id]);
  const pick = missing[Math.floor(rng() * missing.length)];
  const next = { ...book, stickers: { ...book.stickers, [pick.id]: { glitter } } };
  return {
    book: next,
    sticker: { id: pick.id, pageId: page.id, glitter },
    completedPage: isPageComplete(next, page) ? page.id : null,
  };
}

/** Accessory ids whose page is full. */
export function unlockedAccessories(book, pages, accessories) {
  return accessories
    .filter((acc) => {
      const page = pages.find((p) => p.id === acc.page);
      return page && isPageComplete(book, page);
    })
    .map((acc) => acc.id);
}

/** Puts an accessory on or takes it off; only unlocked ones can be worn. */
export function toggleWorn(book, id, pages, accessories) {
  if (!unlockedAccessories(book, pages, accessories).includes(id)) return book;
  const worn = book.worn.includes(id) ? book.worn.filter((w) => w !== id) : [...book.worn, id];
  return { ...book, worn };
}

/**
 * When a page is replaced by another theme, moves stickers earned on the old
 * page (ids starting with `${oldPageId}-`) to the new page one-for-one,
 * keeping glitter, so progress isn't lost. Works on stored data before
 * cleanBook().
 */
export function carryOverPage(stored, oldPageId, newPage) {
  if (!stored?.stickers || !newPage) return stored;
  const old = Object.entries(stored.stickers).filter(([id]) => id.startsWith(`${oldPageId}-`));
  if (!old.length) return stored;
  const stickers = Object.fromEntries(Object.entries(stored.stickers).filter(([id]) => !id.startsWith(`${oldPageId}-`)));
  const free = newPage.stickers.map((s) => s.id).filter((id) => !stickers[id]);
  old.forEach(([, value], i) => {
    if (free[i]) stickers[free[i]] = value;
  });
  return { ...stored, stickers };
}

/** Makes stored data safe to use (unknown stickers and locked accessories dropped). */
export function cleanBook(stored, pages, accessories) {
  const known = new Set(pages.flatMap((p) => p.stickers.map((s) => s.id)));
  const stickers = {};
  for (const [id, value] of Object.entries(stored?.stickers || {})) {
    if (known.has(id)) stickers[id] = { glitter: Boolean(value?.glitter) };
  }
  const book = { stickers, worn: [] };
  const unlocked = unlockedAccessories(book, pages, accessories);
  book.worn = (Array.isArray(stored?.worn) ? stored.worn : []).filter((id) => unlocked.includes(id));
  return book;
}
