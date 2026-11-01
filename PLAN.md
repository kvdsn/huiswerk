# Huiswerk – plan

A homework app for a child in the 2de leerjaar. It reads dictation words and math questions out loud.
The child writes the words on paper and says the math answers out loud.

## Platform
- Web app (PWA) for the iPad, hosted on GitHub Pages from `kvdsn/huiswerk`.
- No backend and no accounts. No score history. Settings are stored on the device.
- Language: Flemish Dutch (`nl-BE`), for both speaking (speechSynthesis) and listening (Safari speech recognition).
- Each math question also has a button to type the answer instead of saying it.

## Interface language and design
- All text on screen is in Flemish Dutch, for example "Dictee", "Rekenen", "Instellingen", "Nog eens horen", "Goed zo!", "Klaar!". Flemish words are used where they differ from Netherlands Dutch, e.g. "juf" and "leerjaar".
- Theme: **unicorns and rainbows**. Pastel pink, lilac and mint, with stars and sparkles in the background.
- Mascot: a small unicorn that reacts. It jumps or claps when an answer is right and gives a gentle encouraging nod when it is wrong. These are the only celebrations: no confetti, sounds or stars.
- Animations are quick and smooth, at 150–400 ms: screens slide or fade in, buttons bounce when tapped, and the mascot reacts. Nothing makes the child wait. Animations respect the iPad's "Reduce Motion" setting.
- Large touch targets and a large rounded font that is easy for a child to read. Built for the iPad in both portrait and landscape.

## Dictation (dictee)
- Words come from `data/woordpakketten.json` (26 packages from werkblaadjes.be, 20 words each).
- Each word is read once on its own. The child can tap a button to hear it again.
- The child writes each word on paper. At the end, the app shows all the correct spellings, and the child or a parent taps right or wrong for each word.
- "het (de) snoep" is read as "het snoep".
- **Voice commands during a dictation:** the app listens after each word.
  - **Next word:** "ja", "klaar", "volgende", "oké"
  - **Repeat the word:** "wablieft?", "wat?", "zeg nog eens"
  - Matching ignores capitals and punctuation, and accepts the command anywhere in what the child says (e.g. "ja klaar!"). It also accepts likely misrecognitions, such as "ok", "okay", "wablief" and "zeg het nog eens".
  - The microphone pauses while the app is speaking. Otherwise the app could hear itself say a word like "ja" (package 6) and skip ahead.
  - The "Volgende" and "Nog eens horen" buttons still work if speech recognition is unavailable or mishears the child.
  - A small microphone icon shows when the app is listening.
- **Enabled packages:** packages 1–7 are enabled by default, because the class is on package 7. The parent settings screen can turn other packages on or off.
- **Choosing what to practise:** one enabled package, or **mixed mode**, which takes 20 random words from all enabled packages with no word repeated in a round.
- Words in a single package are shuffled each round.
- The settings screen has no lock and opens with one tap.

## Math (rekenen)
- Adding, subtracting and times tables, read out loud, and the child says the answer.
- The parent settings screen sets the number range, which operations to include, and which times tables.
- Starting settings: sums up to 100 and times tables 1–5.
- Counting practice is left out for now.
