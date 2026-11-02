// The sticker book, stored on this device only.

import { STICKER_PAGES, ACCESSORIES } from './ui/stickers.js';
import { emptyBook, cleanBook, carryOverPage } from './logic/stickerbook.js';

const KEY = 'huiswerk.stickers.v1';
const OLD_ACCESSORY_PAGES = { kroon: 'regenboog', bril: 'zee', strik: 'dieren', vleugels: 'ruimte' };

export function loadBook() {
  try {
    let stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    // The Snoep page became Zee: keep the stickers already earned there.
    stored = carryOverPage(stored, 'snoep', STICKER_PAGES.find((p) => p.id === 'zee'));
    // The first accessories were replaced by one themed reward per page:
    // keep wearing the reward of the same page.
    if (Array.isArray(stored?.worn)) {
      stored.worn = stored.worn.map((id) => {
        const page = OLD_ACCESSORY_PAGES[id];
        return page ? ACCESSORIES.find((acc) => acc.page === page)?.id || id : id;
      });
    }
    return cleanBook(stored, STICKER_PAGES, ACCESSORIES);
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
