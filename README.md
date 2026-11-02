# Huiswerk 🦄

Een oefen-app voor het 2de leerjaar: **dictee** (de app zegt woordjes, het kind schrijft ze op papier) en **rekenen** (de app zegt een som, het kind zegt het antwoord). Een jonger broertje of zusje in de kleuterklas krijgt eigen spelletjes: tellen, memory, kleuren en vormen, en de eigen naam. Elk kind heeft een eigen dier en stickerboek; namen en instellingen blijven op het toestel.

A static web app (PWA) in Flemish Dutch. Plain HTML, CSS and ES modules, no build step. See [PLAN.md](PLAN.md) for the full design.

## Run locally

```bash
python3 -m http.server 8765
```

Open <http://localhost:8765> in Safari. Speech recognition needs Siri/Dictation to be enabled on the Mac, and the first time Safari asks for microphone access.

On the iPad, speech recognition needs **both Siri and Dictation** turned on (Instellingen → Siri, and Algemeen → Toetsenbord → Dicteren); otherwise iPadOS aborts with "Siri and Dictation are disabled". Tapping the microphone badge in the app shows what the recogniser reports.

For a Flemish voice: System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → Dutch (Belgium).

On localhost you can pretend the child said something from the browser console:

```js
simulateSpeech('klaar')
```

To review all artwork (avatars, rewards, stickers, icons), open <http://localhost:8765/tools/artwork.html>. The `tools/` folder is not published.

## Tests

```bash
npm test
```

## Structure

| Path | What |
| --- | --- |
| `data/woordpakketten.json` | The 26 word packages from werkblaadjes.be |
| `js/app.js` | Screens and flow |
| `js/speech.js` | Speaking and listening (nl-BE) |
| `js/settings.js` | Settings stored on the device |
| `js/profileStore.js` | The two children, stored on the device |
| `js/stickerStore.js` | Each child's sticker book, stored on the device |
| `js/recordings.js` | Words recorded in a parent's voice, stored on the device only |
| `js/logic/` | Voice commands, word rounds, math questions, number parsing, profiles, sticker book rules and toddler games (unit tested) |
| `js/ui/mascot.js` | The child's animal, its rewards and animations |
| `js/ui/avatars/` | The 8 animal avatars; see [CONTRACT.md](js/ui/avatars/CONTRACT.md) for adding one |
| `js/ui/stickers.js` | Sticker and reward artwork |
| `js/ui/shapes.js` | Shapes for Kleuren en vormen |
| `js/ui/sounds.js` | Answer sounds (Web Audio) |
| `tools/artwork.html` | Artwork review page (local only) |
| `sw.js` | Offline cache |

## Deploy

Every push to `main` runs the tests and publishes the site to GitHub Pages via `.github/workflows/pages.yml`. In the repository settings, set **Pages → Source** to **GitHub Actions** once.
