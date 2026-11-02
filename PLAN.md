# Huiswerk – plan

A homework app for a child in the 2de leerjaar. It reads dictation words and math questions out loud.
The child writes the words on paper and says the math answers out loud. Klok lezen and Geld practise telling the time and paying with euros.

## Platform
- Web app (PWA) for the iPad, hosted on GitHub Pages from `kvdsn/huiswerk`.
- No backend and no accounts. No score history. Settings are stored on the device.
- Language: Flemish Dutch (`nl-BE`), for both speaking (speechSynthesis) and listening (Safari speech recognition).
- Each math question also has a button to type the answer instead of saying it.
- Works offline once opened: a service worker keeps every file the app needs, including the Fredoka font, which is served with the app instead of from Google Fonts. Files come from the network first so a new version arrives in one piece, but after 1.5 s without an answer the cached copy is used, so weak Wi-Fi doesn't slow the start.

## Interface language and design
- All text on screen is in Flemish Dutch, for example "Dictee", "Rekenen", "Instellingen", "Nog eens horen", "Goed zo!", "Klaar!". Flemish words are used where they differ from Netherlands Dutch, e.g. "juf" and "leerjaar".
- Theme: **unicorns and rainbows**. Pastel pink, lilac and mint, with stars and sparkles in the background.
- Mascot: the child's own animal (see Children below; a unicorn by default) that reacts. It jumps or claps when an answer is right and gives a gentle encouraging nod when it is wrong. There's no confetti or stars. A short sound plays with each answer: a two-note chime when it's right, a soft descending "boop" when it's wrong (generated with Web Audio; can be switched off in Instellingen). The same sounds play when marking words ✓/✗ after a dictation.
- Animations are quick and smooth, at 150–400 ms: screens slide or fade in, buttons bounce when tapped, and the mascot reacts. Nothing makes the child wait. Animations respect the iPad's "Reduce Motion" setting.
- Large touch targets and a large rounded font that is easy for a child to read. Built for the iPad in both portrait and landscape.
- On an iPad Air every screen a child uses fits without scrolling, upright or sideways, also in Safari with its toolbars. Held sideways the layouts get more compact: the four home tiles (school or toddler) sit in one row, the stickerboek puts its stickers beside the page reward, Nakijken uses tighter rows, an opened envelope shows the sticker beside its text, and the help cards are in three columns (two when upright). In Geld, held sideways, the tray sits beside the table. Only Instellingen, for the parents, scrolls.

## Children (profiles)
- Two fixed children: a schoolkind and a kleuter (no adding or removing). The app opens on whoever played last; two round avatars of the children's animals at the top of the home screen switch child in one tap. No lock.
- Each child has a name, an own sticker book and an own animal avatar, picked from 8: eenhoorn, kat, konijn, panda, vos, uil, pinguïn, draakje. The two children never have the same animal (the other child's is shown as taken). The avatar is the mascot everywhere: it blinks, cheers, nods and shows the sticker-book rewards. Texts follow it ("Mijn panda", "Je kat krijgt…").
- Instellingen has a tab per child ("Voor <naam>": name and avatar, then Woordpakketten, Rekenen, Klok lezen and Geld for the schoolkind or Spelletjes for the kleuter, then that child's Stickerboek with its own reset), followed by "Voor iedereen" (Geluidjes, Stem, Eigen stem). It opens on the child who is playing.
- The schoolkind keeps the original sticker book and the name from the old single-child setting.

## Toddler games (kleuter)
- A kleuter's home screen shows Tellen, Memory, Kleuren en vormen, Mijn naam and Stickerboek instead of Dictee, Rekenen, Klok lezen and Geld. Ellen speaks every instruction (a four-year-old can't read yet). A wrong tap only gets a friendly "Probeer nog eens", without a sound.
- **Tellen:** 5 questions. Up to 5 or 10 copies of a sticker ("Hoeveel zie je er?"), with three big answer buttons showing the number and dots. Tapping the pictures counts along out loud with a number badge.
- **Memory:** 6, 8 or 12 cards with sticker pictures; Ellen names each card when it's turned over.
- **Kleuren en vormen:** 5 questions like "Tik op de gele ster" with 4 big shapes (rondje, vierkantje, driehoekje, ster, hartje) in 7 colours. One other shape has the same colour and one the same shape, so both matter.
- **Mijn naam:** (1) pick her own name among three, (2) pick the first letter of her name among four capitals, (3) put her name together from letter tiles over a faded example. If no name is set, the game asks a grown-up to fill it in.
- Each finished game earns a sticker (glitter without mistakes; for Memory, with few misses).

## Help
- A ❓ button on the home screen opens "Hoe werkt het?": short child-friendly cards for Dictee, Rekenen, Klok lezen, Geld, talking to the app, and Stickers (a kleuter's taps go to the same screen), plus a card for parents about Instellingen.
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
- A full page gives the child's animal a themed surprise: Regenboog → a rainbow behind it, Zee → a seashell crown, Dieren → a teddy bear friend (hops along when an answer is right; it replaced a bunny once the rabbit became an avatar), Ruimte → a planet with stars circling around. They can be switched on and off on the "Mijn <dier>" screen, and show everywhere the animal appears.
- Progress from the first version carries over: Snoep stickers moved to the Zee page, and the old accessories map to the new reward of the same page.
- Stored on the device only. Each child has their own book. In Instellingen, the child's tab → Stickerboek → "Stickerboek wissen" (with a confirmation) clears that child's stickers and rewards.

## Math (rekenen)
- Adding, subtracting and times tables, read out loud, and the child says the answer.
- The parent settings screen sets the number range, which operations to include, and which times tables.
- Starting settings: sums up to 100 and times tables 1–5.
- Counting practice is left out for now.

## School home screen
- The schoolkind's home screen shows four tiles, the same as the kleuter's: Dictee, Rekenen, Klok lezen (🕒 "Hoe laat is het?") and Geld (💶 "Tellen en betalen"), with Stickerboek below.

## Telling the time (klok lezen)
- 8 questions. A big analogue clock shows a time and Ellen asks "Hoe laat is het?". Three big buttons give a time in words ("half vijf", "vier uur", "half vier"); the child taps one or says it.
- The clock is a simple round face with the numbers 1–12, a short thick hour hand and a long thin minute hand in different colours. The hour hand stands where a real one would: at half vijf it is halfway between 4 and 5. No seconds hand.
- Times use the Flemish way of saying them: "vier uur", "half vijf", "kwart na vier", "kwart voor vijf". Only times on a 12-hour clock, no "'s ochtends" or digital times yet.
- The wrong answer buttons are chosen to make the child look: the hour one off, or the half hour on the wrong side ("half vier" for 4:30), so the difference between the two hands matters.
- Speech: the answer is heard like the commands, ignoring capitals and accepting it anywhere in what the child says ("het is half vijf"). Numbers can be said as words or understood as digits ("half 5").
- Right and wrong work like Rekenen: chime and a happy mascot; the first wrong try gets "Bijna! Probeer nog eens", the second shows the right button and Ellen says the time.
- Instellingen → Klok lezen chooses which times appear: hele uren, halve uren, kwartieren (at least one). Starting settings: hele and halve uren.
- A finished round earns a sticker, glitter when every question was right the first time.

## Money (geld)
- 8 questions, mixing two kinds:
  - **Hoeveel is het?** A few coins and notes lie on the table; the child says or types the amount, like a Rekenen answer.
  - **Betaal …** Ellen says "Betaal 7 euro" (from 3 euro up, never an amount that is one coin or note). The child taps coins and notes in a tray to put them on the table (at most 12), and taps one on the table to take it back. A running total is not shown, so the child counts. "Betalen" checks the amount; any combination that adds up is right.
- Euro denominations: coins of 1, 2, 5, 10, 20 and 50 cent, 1 and 2 euro, notes of 5, 10, 20, 50 and 100 euro. They are drawn as simple, friendly pictures in the real colours (copper cents, gold 10–50 cent, two-tone 1 and 2 euro; grey 5, red 10, blue 20, orange 50, green 100) with the value written big, not lifelike copies of real money. The tray only shows the denominations that make sense for the setting.
- Instellingen → Geld sets the highest amount (10, 20, 50 or 100 euro) and whether cents are used. Starting settings: up to 20 euro, whole euros only (so no cent coins). With cents, amounts are like "3 euro 50" and the child can say "drie euro vijftig".
- "Hoeveel is het?" uses at most 6 pieces, so the counting stays doable.
- Right and wrong, sounds, the mascot and the sticker work like Klok lezen. Paying gets three tries: first "Bijna! Tel nog eens.", then whether it was too much or too little ("Dat is te veel"), then the table shows a way to pay it.

