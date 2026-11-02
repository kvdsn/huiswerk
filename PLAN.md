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
- Mascot: a small unicorn that reacts. It jumps or claps when an answer is right and gives a gentle encouraging nod when it is wrong. There's no confetti or stars. A short sound plays with each answer: a two-note chime when it's right, a soft descending "boop" when it's wrong (generated with Web Audio; can be switched off in Instellingen). The same sounds play when marking words ✓/✗ after a dictation.
- Animations are quick and smooth, at 150–400 ms: screens slide or fade in, buttons bounce when tapped, and the mascot reacts. Nothing makes the child wait. Animations respect the iPad's "Reduce Motion" setting.
- Large touch targets and a large rounded font that is easy for a child to read. Built for the iPad in both portrait and landscape.

## Children (profiles)
- Two fixed children: a schoolkind and a kleuter (no adding or removing). The app opens on whoever played last; two round unicorn avatars at the top of the home screen switch child in one tap. No lock.
- Each child has a name, an own sticker book and an own animal avatar, picked from 8: eenhoorn, kat, konijn, panda, vos, uil, pinguïn, draakje. The two children never have the same animal (the other child's is shown as taken). The avatar is the mascot everywhere: it blinks, cheers, nods and shows the sticker-book rewards. Texts follow it ("Mijn panda", "Je kat krijgt…").
- Instellingen has a tab per child ("Voor <naam>": name and avatar, then Woordpakketten and Rekenen for the schoolkind or Spelletjes for the kleuter, then that child's Stickerboek with its own reset), followed by "Voor iedereen" (Geluidjes, Stem, Eigen stem). It opens on the child who is playing.
- The schoolkind keeps the original sticker book and the name from the old single-child setting.

## Toddler games (kleuter)
- A kleuter's home screen shows Tellen, Memory and Stickerboek instead of Dictee and Rekenen. Ellen speaks every instruction (a four-year-old can't read yet). A wrong tap only gets a friendly "Probeer nog eens", without a sound.
- **Tellen:** 5 questions. Up to 5 or 10 copies of a sticker ("Hoeveel zie je er?"), with three big answer buttons showing the number and dots. Tapping the pictures counts along out loud with a number badge.
- **Memory:** 6, 8 or 12 cards with sticker pictures; Ellen names each card when it's turned over.
- **Kleuren en vormen:** 5 questions like "Tik op de gele ster" with 4 big shapes (rondje, vierkantje, driehoekje, ster, hartje) in 7 colours. One other shape has the same colour and one the same shape, so both matter.
- **Mijn naam:** (1) pick her own name among three, (2) pick the first letter of her name among four capitals, (3) put her name together from letter tiles over a faded example. If no name is set, the game asks a grown-up to fill it in.
- Each finished game earns a sticker (glitter without mistakes; for Memory, with few misses).

## Help
- A ❓ button on the home screen opens "Hoe werkt het?": short child-friendly cards for Dictee, Rekenen, talking to the app, and Stickers, plus a card for parents about Instellingen.
- The sticker book starts with a short explanation of how to earn stickers.

## Dictation (dictee)
- Words come from `data/woordpakketten.json` (26 packages from werkblaadjes.be, 20 words each).
- Each word is read once on its own. The child can tap a button to hear it again.
- The child writes each word on paper. At the end, the app shows all the correct spellings, and the child or a parent taps right or wrong for each word.
- "het (de) snoep" is read as "het snoep".
- **Own voice:** a parent can record the words under Instellingen → Eigen stem → Woorden inspreken (one word at a time, played back, then on to the next). During a dictation the recording is played; words without a recording are read by Ellen. Recordings are stored only on the device (IndexedDB) and never uploaded, because the repository is public. A word that appears in several packages is recorded once. A backup button saves all recordings to one file (via the share sheet, e.g. to Files) and can restore them on this or another device.
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

## Sticker book (stickerboek)
- Every finished dictation or math round earns one sticker, shown as an envelope to tap open on the results screen. An all-correct round gives the glitter version.
- 4 themed pages (Regenboog, Zee, Dieren, Ruimte) with 9 stickers each. Stickers fill the current page first, in random order, with no duplicates. Once the album is full, a perfect round turns a plain sticker into glitter.
- A full page gives the child's animal a themed surprise: Regenboog → a rainbow behind it, Zee → a seashell crown, Dieren → a bunny friend (hops along when an answer is right), Ruimte → a planet with stars circling around. They can be switched on and off on the "Mijn <dier>" screen, and show everywhere the animal appears.
- Progress from the first version carries over: Snoep stickers moved to the Zee page, and the old accessories map to the new reward of the same page.
- Stored on the device only. Instellingen → Stickerboek → "Stickerboek wissen" (with a confirmation) clears stickers and rewards.

## Math (rekenen)
- Adding, subtracting and times tables, read out loud, and the child says the answer.
- The parent settings screen sets the number range, which operations to include, and which times tables.
- Starting settings: sums up to 100 and times tables 1–5.
- Counting practice is left out for now.
