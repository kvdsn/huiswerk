# Instructions for Claude

See [README.md](README.md) for how to run and test the app, and [PLAN.md](PLAN.md) for the design.

## Who uses the app
- A child in the 2de leerjaar (about 7) and a kleuter (about 4), on an iPad, with a parent nearby for Instellingen.
- Write for them: short, warm sentences; no time pressure or timers unless a parent turns them on; wrong answers get gentle encouragement, never a scolding sound or text.
- The kleuter can't read yet: every instruction in a toddler game is also spoken, and nothing depends on reading.

## Design rules
- Unicorns-and-rainbows theme: pastel pink, lilac and mint, rounded Fredoka font, soft shadows. Use the colour variables in `css/style.css`.
- Animations are quick (150–400 ms), never make the child wait, and respect "Reduce Motion".
- Large touch targets and big text; everything works with taps alone, speech is a bonus.
- Answer sounds only through `soundCorrect()` / `soundWrong()`, so the Geluidjes setting is respected. No confetti or score history.

## Limits
- No backend, no accounts, no analytics or tracking. Everything is stored on the device only.
- No build step and no npm libraries in the app: plain HTML, CSS and ES modules. npm is only for running the tests.
- It must keep working offline once it has been opened.

## Committing and deploying
- Every commit goes straight to `main` and is pushed right away; no need to ask first. A push to `main` runs the tests and publishes the site to GitHub Pages (`.github/workflows/pages.yml`).
- Run `npm test` before committing. Never push a failing test suite: the deploy would stop at the test job.
- After pushing, confirm the deploy reached the site: `https://kvdsn.github.io/huiswerk/sw.js` serves the new `CACHE` version. `gh` is not installed; the public API (`https://api.github.com/repos/kvdsn/huiswerk/actions/runs?per_page=1`) shows the run's status.

## Subagents
- Hand work to subagents when it splits into independent pieces that don't touch the same files, e.g. new artwork in `js/ui/` next to logic and tests in `js/logic/` and `tests/`, or a broad search through the code.
- Keep work that touches `js/app.js` or `css/style.css` in one place: nearly every feature edits those two files.
- Give each subagent the files it owns, the conventions below, and what "done" looks like. Check its result before relying on it.

## Privacy
- The repository is public. Never put the children's names, photos or recordings in any file, commit message or test. Docs say "the schoolkind" and "the kleuter".

## Conventions
- All text a child or parent sees is in Flemish Dutch (`nl-BE`); code, comments and docs are in English.
- Pure logic goes in `js/logic/` with unit tests in `tests/` (seeded rng, like the existing tests). Screens and DOM code stay in `js/app.js`.
- New files the app loads must be added to `FILES` in `sw.js`, and the `CACHE` version bumped, or the iPad keeps an old copy offline.
- New avatars follow [js/ui/avatars/CONTRACT.md](js/ui/avatars/CONTRACT.md). New artwork also goes on `tools/artwork.html`.
- Update PLAN.md (and README.md's structure table when files are added) in the same commit as the feature.

## Checking a change
- Verify in the browser preview (`huiswerk` in `.claude/launch.json`) at iPad Air sizes: 820×1100 upright and 1180×740 sideways. Every screen a child uses must fit without scrolling (`document.documentElement.scrollHeight <= innerHeight`); only Instellingen may scroll.
- The preview blocks the microphone, so spoken answers can't be tested there; say so, and type or tap instead.
