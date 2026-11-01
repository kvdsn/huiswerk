// Word helpers and round building for the dictation.

// Fisher–Yates shuffle into a new array.
export function shuffle(array, rng = Math.random) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const collapse = (s) => String(s).replace(/\s+/g, ' ').trim();

// Text to speak: drop "(...)" parts. "het (de) snoep" -> "het snoep".
export function spokenForm(word) {
  return collapse(String(word).replace(/\([^)]*\)/g, ' '));
}

// Text to show: as the school writes it, whitespace tidied.
export function displayForm(word) {
  return collapse(word);
}

const entry = (word, packageId) => ({ word, spoken: spokenForm(word), packageId });

// Build a dictation round: one whole package, or `size` unique words mixed from enabled packages.
export function buildRound(pakketten, { mode, packageId, enabled = [], size = 20 } = {}, rng = Math.random) {
  if (mode === 'package') {
    const words = pakketten[packageId] ?? [];
    return shuffle(words.map((w) => entry(w, Number(packageId))), rng);
  }
  if (mode === 'mixed') {
    const all = [];
    for (const id of enabled) {
      for (const w of pakketten[id] ?? []) all.push(entry(w, Number(id)));
    }
    // Shuffle first, then dedupe, so a word in several packages gets a random package.
    const seen = new Set();
    const unique = [];
    for (const e of shuffle(all, rng)) {
      const key = e.spoken.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(e);
    }
    return unique.slice(0, size);
  }
  throw new Error(`Unknown mode: ${mode}`);
}
