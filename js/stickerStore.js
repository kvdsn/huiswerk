// Each child's sticker book, stored on this device only. `key` comes from
// stickerKey() in logic/profiles.js.

import { STICKER_PAGES, ACCESSORIES } from './ui/stickers.js';
import { emptyBook, cleanBook, carryOverPage } from './logic/stickerbook.js';

// Rewards that were replaced, and the page whose reward takes their place.
const OLD_ACCESSORY_PAGES = { kroon: 'regenboog', bril: 'zee', strik: 'dieren', vleugels: 'ruimte', konijntje: 'dieren' };

export function loadBook(key) {
  try {
    let stored = JSON.parse(localStorage.getItem(key) || 'null');
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

export function saveBook(book, key) {
  try {
    localStorage.setItem(key, JSON.stringify(book));
  } catch {
    // Storage blocked: the sticker just won't be remembered.
  }
}

export function resetBook(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing stored.
  }
  return emptyBook();
}
