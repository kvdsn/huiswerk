# Huiswerk 🦄

Een oefen-app voor het 2de leerjaar: **dictee** (de app zegt woordjes, het kind schrijft ze op papier) en **rekenen** (de app zegt een som, het kind zegt het antwoord). De naam van het kind stel je in bij Instellingen; die blijft op het toestel.

A static web app (PWA) in Flemish Dutch. Plain HTML, CSS and ES modules, no build step. See [PLAN.md](PLAN.md) for the full design.

## Run locally

```bash
python3 -m http.server 8765
```

Open <http://localhost:8765> in Safari. Speech recognition needs Siri/Dictation to be enabled on the Mac, and the first time Safari asks for microphone access.

For a Flemish voice: System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → Dutch (Belgium).

On localhost you can pretend the child said something from the browser console:

```js
simulateSpeech('klaar')
```

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
| `js/logic/` | Voice commands, word rounds, math questions and number parsing (unit tested) |
| `js/ui/mascot.js` | The unicorn and its animations |
| `sw.js` | Offline cache |

## Deploy

Every push to `main` runs the tests and publishes the site to GitHub Pages via `.github/workflows/pages.yml`. In the repository settings, set **Pages → Source** to **GitHub Actions** once.
