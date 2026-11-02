// The sticker book, stored on this device only.

import { STICKER_PAGES, ACCESSORIES } from './ui/stickers.js';
import { emptyBook, cleanBook } from './logic/stickerbook.js';

const KEY = 'huiswerk.stickers.v1';

export function loadBook() {
  try {
    return cleanBook(JSON.parse(localStorage.getItem(KEY) || 'null'), STICKER_PAGES, ACCESSORIES);
  } catch {
    return emptyBook();
  }
}

export function saveBook(book) {
  try {
    localStorage.setItem(KEY, JSON.stringify(book));
  } catch {
    // Storage blocked: the sticker just won't be remembered.
  }
}

export function resetBook() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing stored.
  }
  return emptyBook();
}
