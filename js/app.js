import { loadSettings, saveSettings } from './settings.js';
import {
  speak, stopSpeaking, flemishVoiceInfo, preloadVoices, Listener, canListen, simulateSpeech, speechDiagnostics, watchSpeechLog,
} from './speech.js';
import { matchCommandInAlternatives } from './logic/commands.js';
import { buildRound, displayForm, spokenForm, shuffle } from './logic/words.js';
import { makeQuestions, checkAnswer } from './logic/math.js';
import { mountMascot } from './ui/mascot.js';
import { playCorrect, playWrong } from './ui/sounds.js';
import { STICKER_PAGES, ACCESSORIES, ACCESSORY_ICONS } from './ui/stickers.js';
import { award, isPageComplete, unlockedAccessories, toggleWorn } from './logic/stickerbook.js';
import { loadBook, saveBook, resetBook } from './stickerStore.js';
import {
  currentProfile, setCurrent, addProfile, removeProfile, updateProfile, stickerKey,
} from './logic/profiles.js';
import { loadProfiles, saveProfiles } from './profileStore.js';
import { makeShapeQuestion, makeNameGame, COLOURS } from './logic/kleuter.js';
import { shapeSVG } from './ui/shapes.js';
import {
  recordingKey, saveRecording, recordedKeys, loadUrls, revokeUrls, playUrl, stopPlayback, canRecord, Recorder,
  exportRecordings, importRecordings, saveFile,
} from './recordings.js';

const app = document.getElementById('app');
let settings = loadSettings();
// The children using the app; the app opens on whoever played last.
let profiles = loadProfiles(settings.name);
const child = () => currentProfile(profiles);
const bookKey = () => stickerKey(child().id);
let book = loadBook(bookKey());

function switchChild(id) {
  profiles = setCurrent(profiles, id);
  saveProfiles(profiles);
  book = loadBook(bookKey());
}
let pakketten = {};

// Everything started by a screen (listeners, timers) is cleaned up on navigation.
let cleanups = [];
let screenId = 0;

function onLeave(fn) {
  cleanups.push(fn);
}

function render(html) {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  screenId++;
  stopSpeaking();
  stopPlayback();
  app.innerHTML = `<section class="screen">${html}</section>`;
  window.scrollTo({ top: 0 });
  return screenId;
}

const $ = (selector) => app.querySelector(selector);
const $$ = (selector) => [...app.querySelectorAll(selector)];
const isCurrent = (id) => id === screenId;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const say = (text) => speak(text, { voiceURI: settings.voiceURI, rate: settings.rate });

// Answer sounds, unless switched off in Instellingen.
const soundCorrect = () => settings.sounds && playCorrect();
const soundWrong = () => settings.sounds && playWrong();

// "Hoi <naam>!" — names are set in Instellingen and only stored on the device.
const greeting = () => (child().name.trim() ? `Hoi ${child().name.trim()}!` : 'Hoi!');

function mascot(selector = '.mascot-wrap') {
  const el = $(selector);
  return el ? mountMascot(el, { wear: book.worn, palette: child().palette }) : { react() {}, wear() {} };
}

function topbar(title, back = 'home') {
  return `
    <header class="topbar">
      <button class="icon-btn" data-back="${back}" aria-label="Terug">⬅️</button>
      <h1>${title}</h1>
      <span class="spacer"></span>
    </header>`;
}

function bindBack() {
  $$('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => go(btn.dataset.back));
  });
}

function go(name, ...args) {
  const screens = { home, dicteeKies, rekenenStart, instellingen, inspreken, stickerboek, aankleden, help, tellen, memory, kleuren, mijnNaam };
  (screens[name] || home)(...args);
}

const MIC_TEXT = {
  listening: 'Ik luister…',
  idle: 'Even wachten…',
  denied: 'De microfoon mag niet. Gebruik de knoppen.',
  unavailable: 'Praten werkt hier niet (staat Dicteren aan?). Gebruik de knoppen.',
  'dictation-off': 'Dicteren staat uit. Zet het aan: Instellingen → Algemeen → Toetsenbord → Dicteren.',
};

function micBadge() {
  return `<button class="mic off" type="button" aria-live="polite"><span class="dot"></span><span class="mic-text">${
    canListen() ? MIC_TEXT.idle : MIC_TEXT.unavailable
  }</span></button>
  <pre class="speech-log" hidden></pre>`;
}

// Tapping the microphone badge shows what speech recognition reported.
function bindSpeechLog() {
  const badge = $('.mic');
  const panel = $('.speech-log');
  const refresh = () => {
    panel.textContent = speechDiagnostics();
    panel.scrollTop = panel.scrollHeight;
  };
  badge.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) refresh();
  });
  onLeave(watchSpeechLog(() => !panel.hidden && refresh()));
}

function setMic(state) {
  const el = $('.mic');
  if (!el) return;
  el.classList.toggle('listening', state === 'listening');
  el.classList.toggle('off', state !== 'listening');
  el.querySelector('.mic-text').textContent = MIC_TEXT[state] || MIC_TEXT.idle;
}

// ---------- Home ----------

function home() {
  const kleuter = child().kind === 'kleuter';
  const tiles = kleuter
    ? `<button class="tile sun" id="to-tellen" style="--i:0">
          <span class="emoji">🐠</span>Tellen<small>Hoeveel zie je er?</small>
        </button>
        <button class="tile blue" id="to-memory" style="--i:1">
          <span class="emoji">🃏</span>Memory<small>Zoek de twee dezelfde</small>
        </button>
        <button class="tile pink" id="to-kleuren" style="--i:2">
          <span class="emoji">🎨</span>Kleuren en vormen<small>Tik op de gele ster</small>
        </button>
        <button class="tile mint" id="to-naam" style="--i:3">
          <span class="emoji">🔤</span>Mijn naam<small>Ken je je naam?</small>
        </button>`
    : `<button class="tile pink" id="to-dictee" style="--i:0">
          <span class="emoji">✏️</span>Dictee<small>Woordjes schrijven</small>
        </button>
        <button class="tile mint" id="to-rekenen" style="--i:1">
          <span class="emoji">🔢</span>Rekenen<small>Sommen zeggen</small>
        </button>`;
  render(`
    <header class="topbar">
      <button class="icon-btn" id="to-help" aria-label="Hoe werkt het?">❓</button>
      <div class="topbar-middle">${avatars()}</div>
      <button class="icon-btn" id="to-settings" aria-label="Instellingen">⚙️</button>
    </header>
    <div class="center">
      <div class="mascot-wrap"></div>
      <h2 class="hello rainbow-text">${escape(greeting())}</h2>
      <p class="lead">${kleuter ? 'Wat gaan we spelen?' : 'Wat gaan we vandaag oefenen?'}</p>
      <div class="menu">
        ${tiles}
        <button class="tile lilac wide-tile" id="to-stickers" style="--i:2">
          <span class="emoji">📒</span>Stickerboek<small>${stickerCount()} stickers verzameld</small>
        </button>
      </div>
    </div>
  `);
  mascot();
  bindAvatars();
  $('#to-dictee')?.addEventListener('click', () => go('dicteeKies'));
  $('#to-rekenen')?.addEventListener('click', () => go('rekenenStart'));
  $('#to-tellen')?.addEventListener('click', () => go('tellen'));
  $('#to-memory')?.addEventListener('click', () => go('memory'));
  $('#to-kleuren')?.addEventListener('click', () => go('kleuren'));
  $('#to-naam')?.addEventListener('click', () => go('mijnNaam'));
  $('#to-stickers').addEventListener('click', () => go('stickerboek'));
  $('#to-settings').addEventListener('click', () => go('instellingen'));
  $('#to-help').addEventListener('click', () => go('help'));
}

// ---------- Dictation ----------

const TILE_COLORS = ['pink', 'lilac', 'mint', 'peach', 'blue', 'sun'];

function dicteeKies() {
  const enabled = settings.enabledPackages.filter((id) => pakketten[id]);
  render(`
    ${topbar('Dictee')}
    <p class="lead" style="text-align:center">Kies een woordpakket</p>
    <div class="packages">
      <button class="tile wide lilac" data-mode="mixed" style="--i:0">
        <span class="emoji">🌈</span><span>Gemengd<br><small>20 woordjes uit alle pakketten</small></span>
      </button>
      ${enabled
        .map(
          (id, i) => `
        <button class="tile ${TILE_COLORS[i % TILE_COLORS.length]}" data-package="${id}" style="--i:${i + 1}">
          <small>Pakket</small>${id}
        </button>`,
        )
        .join('')}
    </div>
  `);
  bindBack();
  $('[data-mode="mixed"]').addEventListener('click', () => {
    dicteeIntro(buildRound(pakketten, { mode: 'mixed', enabled, size: 20 }), 'Gemengd');
  });
  $$('[data-package]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const packageId = Number(btn.dataset.package);
      dicteeIntro(buildRound(pakketten, { mode: 'package', packageId }), `Pakket ${packageId}`);
    });
  });
}

function dicteeIntro(round, title) {
  if (!round.length) return go('dicteeKies');
  const id = render(`
    ${topbar(title, 'dicteeKies')}
    <div class="center">
      <div class="mascot-wrap"></div>
      <p class="lead">Neem je blad en je potlood.<br>Ik zeg ${round.length} woordjes.</p>
      <p class="hint">Zeg <b>“klaar”</b> als je een woord geschreven hebt.<br>
        Zeg <b>“wablieft?”</b> als je het nog eens wil horen.</p>
      <button class="btn primary big" id="start" disabled>Ik ben klaar! 🦄</button>
    </div>
  `);
  bindBack();
  mascot();

  // Load recordings in the parent's voice now, so the first word can play
  // straight from the tap below (iOS only allows sound from a tap).
  let urls = new Map();
  let started = false;
  onLeave(() => started || revokeUrls(urls));
  loadUrls(round.map((item) => item.spoken)).then((loaded) => {
    if (!isCurrent(id)) return revokeUrls(loaded);
    urls = loaded;
    $('#start').disabled = false;
  });
  $('#start').addEventListener('click', () => {
    started = true;
    dicteeRun(round, title, urls);
  });
}

function dicteeRun(round, title, urls = new Map()) {
  const id = render(`
    ${topbar(title, 'dicteeKies')}
    <div class="center">
      <p class="counter"></p>
      <div class="progress"><span style="width:0%"></span></div>
      <button class="speaker" id="repeat" aria-label="Nog eens horen">🔊</button>
      ${micBadge()}
      <div class="row">
        <button class="btn" id="repeat-btn">🔁 Nog eens horen</button>
        <button class="btn primary" id="next">Volgende ➡️</button>
      </div>
      <p class="hint">Zeg <b>“klaar”</b>, <b>“ja”</b> of <b>“volgende”</b> voor het volgende woord.</p>
    </div>
  `);
  bindBack();
  bindSpeechLog();

  let index = 0;
  let finishing = false;
  let lastAdvance = 0;
  // Each sayWord() gets a number; an older one that was interrupted must not
  // reopen the microphone while the newer one is still talking.
  let speechSeq = 0;

  const listener = new Listener({
    interim: true,
    onState: (state) => isCurrent(id) && setMic(state),
    onResult: (alternatives) => {
      if (finishing || !isCurrent(id)) return;
      const command = matchCommandInAlternatives(alternatives);
      if (command === 'next') next();
      else if (command === 'repeat') sayWord();
    },
  });
  onLeave(() => listener.stop());
  onLeave(() => revokeUrls(urls));

  function show() {
    $('.counter').textContent = `Woord ${index + 1} van ${round.length}`;
    $('.progress > span').style.width = `${(index / round.length) * 100}%`;
  }

  // Buttons may interrupt the voice; the microphone only listens in between.
  async function sayWord() {
    if (finishing) return;
    const mine = ++speechSeq;
    listener.stop(); // Don't let the microphone hear the app itself.
    const speaker = $('#repeat');
    speaker.classList.add('talking');
    // The parent's own recording if there is one, otherwise Ellen.
    const url = urls.get(recordingKey(round[index].spoken));
    await (url ? playUrl(url) : say(round[index].spoken));
    if (!isCurrent(id) || mine !== speechSeq) return;
    speaker.classList.remove('talking');
    listener.start();
  }

  async function next() {
    // A voice command and a tap arriving together must not skip a word.
    if (finishing || Date.now() - lastAdvance < 700) return;
    lastAdvance = Date.now();
    if (index + 1 >= round.length) {
      finishing = true;
      speechSeq++;
      stopPlayback();
      listener.stop();
      $('.progress > span').style.width = '100%';
      await say('Dat was het laatste woord. Goed gedaan!');
      if (isCurrent(id)) dicteeNakijken(round, title);
      return;
    }
    index++;
    show();
    sayWord();
  }

  $('#repeat').addEventListener('click', sayWord);
  $('#repeat-btn').addEventListener('click', sayWord);
  $('#next').addEventListener('click', next);

  show();
  sayWord();
}

function dicteeNakijken(round, title) {
  render(`
    ${topbar('Nakijken', 'dicteeKies')}
    <p class="lead" style="text-align:center">Kijk je blad na. Tik op ✗ bij een fout.</p>
    <ol class="check-list">
      ${round
        .map(
          (item, i) => `
        <li class="check-item good" data-i="${i}" style="--i:${i}">
          <span class="num">${i + 1}.</span>
          <span class="word">${escape(displayForm(item.word))}</span>
          <button class="mark yes on" aria-label="Goed" aria-pressed="true">✓</button>
          <button class="mark no" aria-label="Fout" aria-pressed="false">✗</button>
        </li>`,
        )
        .join('')}
    </ol>
    <div class="row"><button class="btn primary big" id="done">Klaar met nakijken</button></div>
  `);
  bindBack();

  const wrong = new Set();
  $$('.check-item').forEach((li) => {
    const i = Number(li.dataset.i);
    const yes = li.querySelector('.yes');
    const no = li.querySelector('.no');
    const set = (isWrong) => {
      if (isWrong) wrong.add(i);
      else wrong.delete(i);
      li.classList.toggle('good', !isWrong);
      li.classList.toggle('bad', isWrong);
      yes.classList.toggle('on', !isWrong);
      no.classList.toggle('on', isWrong);
      yes.setAttribute('aria-pressed', String(!isWrong));
      no.setAttribute('aria-pressed', String(isWrong));
    };
    yes.addEventListener('click', () => {
      if (wrong.has(i)) soundCorrect();
      set(false);
    });
    no.addEventListener('click', () => {
      if (!wrong.has(i)) soundWrong();
      set(true);
    });
  });

  $('#done').addEventListener('click', () => {
    dicteeResultaat(round, round.filter((_, i) => wrong.has(i)), title);
  });
}

function dicteeResultaat(round, mistakes, title) {
  const good = round.length - mistakes.length;
  const message =
    mistakes.length === 0 ? 'Alles juist! Super!' : good >= round.length * 0.8 ? 'Heel goed gedaan!' : 'Goed geoefend!';
  render(`
    ${topbar('Klaar!', 'dicteeKies')}
    <div class="center">
      <div class="mascot-wrap"></div>
      <p class="score rainbow-text">${good} van ${round.length} goed</p>
      <p class="lead">${message}</p>
      <div class="reward"></div>
      <div class="row">
        ${mistakes.length ? '<button class="btn primary big" id="again-wrong">Foutjes nog eens oefenen</button>' : ''}
        <button class="btn mint big" id="again">Nog een dictee</button>
      </div>
      <button class="btn" id="home">🏠 Naar het begin</button>
    </div>
  `);
  bindBack();
  const m = mascot();
  setTimeout(() => m.react(mistakes.length === 0 || good >= round.length * 0.8 ? 'happy' : 'encourage'), 250);
  giveSticker(mistakes.length === 0, m);
  $('#again-wrong')?.addEventListener('click', () => dicteeIntro(mistakes, `${title} – foutjes`));
  $('#again').addEventListener('click', () => go('dicteeKies'));
  $('#home').addEventListener('click', () => go('home'));
}

// ---------- Math ----------

function mathSummary(math) {
  const ops = [math.ops.plus && 'plus', math.ops.min && 'min', math.ops.maal && 'maal'].filter(Boolean);
  const parts = [];
  if (math.ops.plus || math.ops.min) parts.push(`sommen tot ${math.max}`);
  if (math.ops.maal) parts.push(`tafels van ${math.tables.join(', ')}`);
  return `${math.count} vragen · ${ops.join(', ')} · ${parts.join(' · ')}`;
}

function rekenenStart() {
  render(`
    ${topbar('Rekenen')}
    <div class="center">
      <div class="mascot-wrap"></div>
      <p class="lead">Ik zeg een som.<br>Jij zegt het antwoord!</p>
      <p class="hint">${escape(mathSummary(settings.math))}</p>
      <button class="btn primary big" id="start">Start! 🦄</button>
    </div>
  `);
  bindBack();
  mascot();
  $('#start').addEventListener('click', () => rekenenRun(makeQuestions(settings.math, settings.math.count)));
}

function rekenenRun(questions) {
  const id = render(`
    ${topbar('Rekenen', 'rekenenStart')}
    <div class="center">
      <p class="counter"></p>
      <div class="progress"><span style="width:0%"></span></div>
      <div class="mascot-wrap small"></div>
      <p class="sum"></p>
      <p class="feedback" aria-live="assertive"></p>
      ${micBadge()}
      <form class="answer-form" autocomplete="off" novalidate>
        <input type="text" inputmode="numeric" aria-label="Antwoord" placeholder="?">
        <button class="btn primary" type="submit">OK</button>
      </form>
      <button class="btn" id="repeat">🔁 Nog eens horen</button>
    </div>
  `);
  bindBack();
  bindSpeechLog();
  const m = mascot();
  const input = $('.answer-form input');

  let index = 0;
  let tries = 0;
  let score = 0;
  // True while an answer is being judged (feedback showing, answer revealed).
  let judging = false;
  // See dicteeRun: stops an interrupted question from reopening the mic.
  let speechSeq = 0;

  const listener = new Listener({
    interim: false,
    continuous: false,
    onState: (state) => isCurrent(id) && setMic(state),
    onResult: (alternatives, isFinal) => {
      if (judging || !isFinal || !isCurrent(id)) return;
      if (matchCommandInAlternatives(alternatives) === 'repeat') return sayQuestion();
      answer(alternatives);
    },
  });
  onLeave(() => listener.stop());

  const question = () => questions[index];

  function show() {
    tries = 0;
    $('.counter').textContent = `Vraag ${index + 1} van ${questions.length}`;
    $('.progress > span').style.width = `${(index / questions.length) * 100}%`;
    $('.sum').innerHTML = `${escape(question().display)} = <span class="q">?</span>`;
    $('.feedback').textContent = '';
    $('.feedback').className = 'feedback';
    input.value = '';
  }

  async function sayQuestion() {
    if (judging) return;
    const mine = ++speechSeq;
    listener.stop();
    await say(question().spoken);
    if (!isCurrent(id) || mine !== speechSeq) return;
    listener.start();
  }

  async function answer(heardOrTyped) {
    if (judging) return;
    const result = checkAnswer(question(), heardOrTyped);
    const feedback = $('.feedback');
    if (result.heard === null) {
      feedback.className = 'feedback';
      feedback.textContent = 'Ik verstond je niet. Zeg het nog eens?';
      return;
    }
    // A typed answer may arrive while the question is still being read.
    judging = true;
    speechSeq++;
    stopSpeaking();
    listener.stop();
    input.value = String(result.heard);

    if (result.correct) {
      if (tries === 0) score++;
      $('.sum').innerHTML = `${escape(question().display)} = <span class="q">${question().answer}</span>`;
      feedback.className = 'feedback good';
      feedback.textContent = 'Goed zo! ⭐';
      m.react('happy');
      soundCorrect();
      await wait(1000);
      return isCurrent(id) && advance();
    }

    tries++;
    m.react('encourage');
    soundWrong();
    // Restart the animation by re-adding the class.
    feedback.className = 'feedback';
    void feedback.offsetWidth;
    feedback.className = 'feedback bad';
    if (tries === 1) {
      feedback.textContent = `${result.heard}? Bijna! Probeer nog eens.`;
      await wait(700);
      if (!isCurrent(id)) return;
      input.value = '';
      judging = false;
      listener.start();
      return;
    }
    feedback.textContent = `Het antwoord is ${question().answer}.`;
    $('.sum').innerHTML = `${escape(question().display)} = <span class="q">${question().answer}</span>`;
    await say(`${question().spoken} is ${question().answer}`);
    await wait(600);
    if (isCurrent(id)) advance();
  }

  function advance() {
    judging = false;
    index++;
    if (index >= questions.length) return rekenenResultaat(score, questions.length);
    show();
    sayQuestion();
  }

  $('.answer-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value.trim()) answer(input.value.trim());
  });
  $('#repeat').addEventListener('click', sayQuestion);

  show();
  sayQuestion();
}

function rekenenResultaat(score, total) {
  render(`
    ${topbar('Klaar!', 'rekenenStart')}
    <div class="center">
      <div class="mascot-wrap"></div>
      <p class="score rainbow-text">${score} van ${total} meteen goed</p>
      <p class="lead">${score === total ? 'Alles juist! Super!' : score >= total * 0.8 ? 'Heel goed gedaan!' : 'Goed geoefend!'}</p>
      <div class="reward"></div>
      <div class="row">
        <button class="btn primary big" id="again">Nog eens</button>
        <button class="btn mint big" id="home">🏠 Naar het begin</button>
      </div>
    </div>
  `);
  bindBack();
  const m = mascot();
  setTimeout(() => m.react(score >= total * 0.8 ? 'happy' : 'encourage'), 250);
  giveSticker(score === total, m);
  $('#again').addEventListener('click', () => rekenenRun(makeQuestions(settings.math, settings.math.count)));
  $('#home').addEventListener('click', () => go('home'));
}

// ---------- Settings ----------

function chips(name, values, isOn, label = (v) => v) {
  return `<div class="chips" data-group="${name}">${values
    .map((v) => `<button class="chip" data-value="${v}" aria-pressed="${isOn(v)}">${label(v)}</button>`)
    .join('')}</div>`;
}

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

async function instellingen() {
  const id = render(`
    ${topbar('Instellingen')}
    <div class="settings">
      <div class="card">
        <h2>🦄 Kinderen</h2>
        <p>Elk kind heeft een eigen eenhoorn en stickerboek. De app opent bij wie het laatst speelde;
          wisselen doe je met de eenhoorntjes bovenaan. Namen blijven op dit toestel.</p>
        <div class="kids">${profiles.profiles.map(kidCard).join('')}</div>
        <button class="btn" id="add-kid">➕ Kind toevoegen</button>
      </div>
      <div class="card">
        <h2>✏️ Woordpakketten</h2>
        <p>Deze pakketten kan je kiezen. “Gemengd” neemt woordjes uit al deze pakketten.</p>
        ${chips('packages', Object.keys(pakketten).map(Number), (v) => settings.enabledPackages.includes(v))}
      </div>
      <div class="card">
        <h2>🔢 Rekenen</h2>
        <p>Soort sommen</p>
        ${chips('ops', ['plus', 'min', 'maal'], (v) => settings.math.ops[v], (v) => ({ plus: '+ plus', min: '− min', maal: '× maal' })[v])}
        <p style="margin-top:16px">Sommen tot</p>
        ${chips('max', [10, 20, 50, 100, 1000], (v) => settings.math.max === v)}
        <p style="margin-top:16px">Maaltafels</p>
        ${chips('tables', range(1, 10), (v) => settings.math.tables.includes(v))}
        <p style="margin-top:16px">Aantal vragen</p>
        ${chips('count', [5, 10, 15, 20], (v) => settings.math.count === v)}
      </div>
      <div class="card">
        <h2>📒 Stickerboek${child().name.trim() ? ` van ${escape(child().name.trim())}` : ''}</h2>
        <p>${stickerCount()} van ${STICKER_PAGES.reduce((n, p) => n + p.stickers.length, 0)} stickers verzameld.
          Wissen begint het stickerboek opnieuw; ook de verrassingen van de eenhoorn verdwijnen.</p>
        <button class="btn" id="reset-stickers">🗑️ Stickerboek wissen</button>
      </div>
      <div class="card">
        <h2>🔔 Geluidjes</h2>
        <p>Een belletje bij een goed antwoord, een zachte toon bij een fout.</p>
        ${chips('sounds', ['aan', 'uit'], (v) => settings.sounds === (v === 'aan'))}
      </div>
      <div class="card">
        <h2>🔊 Stem</h2>
        <div class="field">
          <select id="voice" aria-label="Stem"></select>
          <label>Snelheid <input id="rate" type="range" min="0.6" max="1.2" step="0.05" value="${settings.rate}"></label>
          <button class="btn" id="test-voice">Test</button>
        </div>
        <div id="voice-note"></div>
      </div>
      <div class="card">
        <h2>🎙️ Eigen stem</h2>
        <p>Spreek de woordjes zelf in. Bij een dictee hoort je kind dan jouw stem; woordjes die je nog niet
          inspraak, leest Ellen voor. De opnames blijven op dit toestel.</p>
        <p id="rec-count"></p>
        <button class="btn primary" id="to-record">Woorden inspreken</button>
        <h3>Reservekopie</h3>
        <p>Bewaar je opnames in een bestand, bijvoorbeeld in Bestanden. Zo raak je ze niet kwijt als de app
          verwijderd wordt, en kan je ze terugzetten op dit of een ander toestel.</p>
        <div class="row backup-row">
          <button class="btn" id="backup-make">💾 Kopie maken</button>
          <button class="btn" id="backup-restore">📂 Kopie terugzetten</button>
          <input type="file" id="backup-file" accept=".json,application/json" hidden>
        </div>
        <p id="backup-status" aria-live="polite"></p>
      </div>
    </div>
  `);
  bindBack();
  bindKids();

  const update = (change) => {
    change(settings);
    saveSettings(settings);
  };

  const toggleIn = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value].sort((a, b) => a - b));

  $$('.chips[data-group]').forEach((group) => {
    group.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      const raw = chip.dataset.value;
      const value = Number.isNaN(Number(raw)) ? raw : Number(raw);
      const name = group.dataset.group;

      if (name === 'packages') {
        const next = toggleIn(settings.enabledPackages, value);
        if (!next.length) return; // Keep at least one package.
        update((s) => { s.enabledPackages = next; });
      } else if (name === 'tables') {
        const next = toggleIn(settings.math.tables, value);
        if (!next.length) return;
        update((s) => { s.math.tables = next; });
      } else if (name === 'ops') {
        const ops = { ...settings.math.ops, [value]: !settings.math.ops[value] };
        if (!Object.values(ops).some(Boolean)) return;
        update((s) => { s.math.ops = ops; });
      } else if (name === 'max' || name === 'count') {
        update((s) => { s.math[name] = value; });
      } else if (name === 'sounds') {
        update((s) => { s.sounds = value === 'aan'; });
        if (settings.sounds) soundCorrect();
      }

      const pressed = {
        packages: (v) => settings.enabledPackages.includes(v),
        tables: (v) => settings.math.tables.includes(v),
        ops: (v) => settings.math.ops[v],
        max: (v) => settings.math.max === v,
        count: (v) => settings.math.count === v,
        sounds: (v) => settings.sounds === (v === 'aan'),
      }[name];
      group.querySelectorAll('.chip').forEach((c) => {
        const v = Number.isNaN(Number(c.dataset.value)) ? c.dataset.value : Number(c.dataset.value);
        c.setAttribute('aria-pressed', String(Boolean(pressed(v))));
      });
    });
  });

  const { voices, onlyBasic } = await flemishVoiceInfo();
  if (!isCurrent(id)) return;
  const select = $('#voice');
  select.innerHTML = voices.length
    ? voices.map((v) => `<option value="${escape(v.voiceURI)}">${escape(v.name)}</option>`).join('')
    : '<option value="">Standaardstem</option>';
  if (voices.some((v) => v.voiceURI === settings.voiceURI)) select.value = settings.voiceURI;
  const note = (title) => `
    <div class="note">
      <strong>${title}</strong>
      <ul>
        <li><b>Mac:</b> Systeeminstellingen → Toegankelijkheid → Gesproken materiaal → Systeemstem → Beheer stemmen → Nederlands (België)</li>
        <li><b>iPad:</b> Instellingen → Toegankelijkheid → Gesproken materiaal → Stemmen → Nederlands</li>
      </ul>
    </div>`;
  $('#voice-note').innerHTML = !voices.length
    ? note('Er is geen Vlaamse stem geïnstalleerd.')
    : onlyBasic
      ? note('💡 Tip: download de “verbeterde” versie van Ellen. Die klinkt veel natuurlijker.')
      : '';

  select.addEventListener('change', () => update((s) => { s.voiceURI = select.value; }));
  $('#rate').addEventListener('input', (event) => update((s) => { s.rate = Number(event.target.value); }));
  $('#test-voice').addEventListener('click', () => say(`${greeting()} Het woord is: de regenboog.`));
  $('#to-record').addEventListener('click', () => go('inspreken'));
  $('#reset-stickers').addEventListener('click', () => {
    if (!window.confirm('Alle stickers en verrassingen van de eenhoorn wissen? Dit kan je niet ongedaan maken.')) return;
    book = resetBook(bookKey());
    instellingen();
  });
  const backupStatus = (text) => { $('#backup-status').textContent = text; };
  const refreshCount = async () => {
    const total = allWordKeys();
    const keys = await recordedKeys();
    if (!isCurrent(id)) return;
    const done = [...total].filter((key) => keys.has(key)).length;
    $('#rec-count').textContent = `${done} van ${total.size} woordjes ingesproken.`;
  };

  // Making the file takes a moment, and iPadOS only opens the share sheet
  // straight from a tap. So: first tap makes the copy, second tap saves it.
  let backup = null;
  $('#backup-make').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    if (backup) {
      if (await saveFile(backup.file)) backupStatus(`✓ Kopie met ${backup.count} woordjes bewaard.`);
      return;
    }
    button.disabled = true;
    button.textContent = '⏳ Kopie maken…';
    const made = await exportRecordings();
    if (!isCurrent(id)) return;
    button.disabled = false;
    if (!made.count) {
      button.textContent = '💾 Kopie maken';
      return backupStatus('Er zijn nog geen opnames om te bewaren.');
    }
    backup = made;
    const bytes = made.file.size;
    const size = bytes < 1e6 ? `${Math.max(1, Math.round(bytes / 1e3))} kB` : `${(bytes / 1e6).toFixed(1).replace('.', ',')} MB`;
    button.textContent = `📤 Kopie bewaren (${size})`;
    button.classList.add('primary');
    backupStatus(`De kopie met ${made.count} woordjes is klaar. Tik op “Kopie bewaren” en kies bv. “Bewaar in Bestanden”.`);
  });

  $('#backup-restore').addEventListener('click', () => $('#backup-file').click());
  $('#backup-file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    backupStatus('⏳ Opnames terugzetten…');
    try {
      const count = await importRecordings(file);
      if (!isCurrent(id)) return;
      backupStatus(`✓ ${count} woordjes teruggezet.`);
      refreshCount();
    } catch {
      if (isCurrent(id)) backupStatus('Dit bestand is geen kopie van de opnames.');
    }
  });

  refreshCount();
}

// ---------- Children ----------

/** Round unicorn buttons to switch child (only when there is more than one). */
function avatars() {
  if (profiles.profiles.length < 2) return '';
  return `<div class="avatars">${profiles.profiles
    .map((p) => `<button class="avatar" data-kid="${p.id}" aria-pressed="${p.id === profiles.current}"
        aria-label="${escape(p.name.trim() || 'Kind')}"><span class="avatar-mascot" data-palette="${p.palette}"></span></button>`)
    .join('')}</div>`;
}

function mountAvatarMascots(root = app) {
  root.querySelectorAll('.avatar-mascot').forEach((el) => {
    el.innerHTML = '';
    mountMascot(el, { palette: el.dataset.palette });
  });
}

function bindAvatars() {
  mountAvatarMascots();
  $$('.avatar').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (btn.dataset.kid === profiles.current) return;
      switchChild(btn.dataset.kid);
      home();
    }),
  );
}

function kidCard(p) {
  const chip = (field, value, label) =>
    `<button class="chip" data-field="${field}" data-value="${value}" aria-pressed="${p[field] === value}">${label}</button>`;
  return `
    <div class="kid" data-kid="${p.id}">
      <div class="kid-head">
        <span class="avatar-mascot kid-avatar" data-palette="${p.palette}"></span>
        <input class="kid-name" type="text" maxlength="20" autocomplete="off" placeholder="Naam"
          aria-label="Naam" value="${escape(p.name)}">
        ${profiles.profiles.length > 1 ? '<button class="icon-btn kid-remove" aria-label="Kind verwijderen">🗑️</button>' : ''}
      </div>
      <div class="chips">${chip('kind', 'school', '🎒 Schoolkind')}${chip('kind', 'kleuter', '🧸 Kleuter')}</div>
      <div class="chips">${chip('palette', 'roze', '🩷 Roze eenhoorn')}${chip('palette', 'paars', '💜 Paarse eenhoorn')}</div>
      ${p.kind === 'kleuter' ? `
        <p class="kid-label">Tellen tot</p>
        <div class="chips">${chip('tellenMax', 5, '5')}${chip('tellenMax', 10, '10')}</div>
        <p class="kid-label">Memory</p>
        <div class="chips">${chip('memoryCards', 6, '6 kaartjes')}${chip('memoryCards', 8, '8 kaartjes')}${chip('memoryCards', 12, '12 kaartjes')}</div>` : ''}
    </div>`;
}

function bindKids() {
  const box = $('.kids');
  const refresh = () => {
    box.innerHTML = profiles.profiles.map(kidCard).join('');
    mountAvatarMascots(box);
  };
  const change = (next) => {
    profiles = next;
    saveProfiles(profiles);
  };
  refresh();

  box.addEventListener('input', (event) => {
    if (!event.target.matches('.kid-name')) return;
    const id = event.target.closest('.kid').dataset.kid;
    change(updateProfile(profiles, id, { name: event.target.value }));
  });

  box.addEventListener('click', (event) => {
    const kid = event.target.closest('.kid');
    if (!kid) return;
    const id = kid.dataset.kid;
    const chip = event.target.closest('.chip[data-field]');
    if (chip) {
      const raw = chip.dataset.value;
      const value = Number.isNaN(Number(raw)) ? raw : Number(raw);
      change(updateProfile(profiles, id, { [chip.dataset.field]: value }));
      refresh();
      return;
    }
    if (event.target.closest('.kid-remove')) {
      const name = profiles.profiles.find((p) => p.id === id)?.name.trim() || 'Dit kind';
      if (!window.confirm(`${name} verwijderen? Ook het stickerboek van ${name} wordt gewist.`)) return;
      resetBook(stickerKey(id));
      change(removeProfile(profiles, id));
      book = loadBook(bookKey());
      // Redraw everything: the sticker-book card may now belong to another child.
      instellingen();
    }
  });

  $('#add-kid').addEventListener('click', () => {
    const added = addProfile(profiles);
    change(added.state);
    refresh();
    box.querySelector(`[data-kid="${added.profile.id}"] .kid-name`)?.focus();
  });
}

// ---------- Toddler games ----------

const NUMBER_WORDS = ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien'];
const allStickers = () => STICKER_PAGES.flatMap((page) => page.stickers);
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

/** Three different answers around n, within 1..max, in random order. */
function countOptions(n, max) {
  const options = new Set([n]);
  for (const delta of shuffle([-2, -1, 1, 2])) {
    if (options.size === 3) break;
    if (n + delta >= 1 && n + delta <= max) options.add(n + delta);
  }
  for (let k = 1; options.size < 3 && k <= max; k++) options.add(k);
  return shuffle([...options]);
}

function tellen() {
  const QUESTIONS = 5;
  const max = child().tellenMax;
  const id = render(`
    ${topbar('Tellen')}
    <div class="center game">
      <div class="steps">${'<span></span>'.repeat(QUESTIONS)}</div>
      <div class="mascot-wrap small"></div>
      <p class="lead">Hoeveel zie je er?</p>
      <div class="count-field"></div>
      <div class="answers"></div>
      <p class="hint">Tik op de plaatjes om mee te tellen.</p>
    </div>
  `);
  bindBack();
  const m = mascot();
  let index = 0;
  let perfect = true;
  let previous = 0;

  function ask() {
    let n;
    do n = 1 + Math.floor(Math.random() * max);
    while (n === previous && max > 1);
    previous = n;
    const sticker = pickOne(allStickers());
    let counted = 0;
    let busy = false;
    $$('.steps span').forEach((dot, i) => dot.classList.toggle('done', i < index));
    $('.count-field').innerHTML = Array.from({ length: n }, (_, i) =>
      `<button class="count-item" style="--i:${i}" aria-label="Plaatje ${i + 1}">${sticker.svg}</button>`).join('');
    $('.answers').innerHTML = countOptions(n, max)
      .map((k) => `<button class="answer" data-n="${k}"><b>${k}</b><span class="dots">${'<i></i>'.repeat(k)}</span></button>`)
      .join('');
    say('Hoeveel zie je er?');

    $$('.count-item').forEach((item) =>
      item.addEventListener('click', () => {
        if (busy || item.dataset.count) return;
        counted++;
        item.dataset.count = counted;
        item.classList.add('counted');
        say(NUMBER_WORDS[counted]);
      }),
    );
    $$('.answer').forEach((btn) =>
      btn.addEventListener('click', async () => {
        if (busy || btn.disabled) return;
        const k = Number(btn.dataset.n);
        if (k !== n) {
          perfect = false;
          btn.disabled = true;
          btn.classList.add('nope');
          m.react('encourage');
          say('Probeer nog eens. Tel maar mee!');
          return;
        }
        busy = true;
        btn.classList.add('right');
        soundCorrect();
        m.react('happy');
        await say(n === 1 ? 'Ja! Er is er één.' : `Ja! Het zijn er ${NUMBER_WORDS[n]}.`);
        await wait(300);
        if (!isCurrent(id)) return;
        index++;
        if (index >= QUESTIONS) kleuterResultaat('tellen', perfect);
        else ask();
      }),
    );
  }
  ask();
}

function memory() {
  const cards = child().memoryCards;
  const pairs = cards / 2;
  const deck = shuffle(shuffle(allStickers()).slice(0, pairs).flatMap((s) => [s, s]));
  const id = render(`
    ${topbar('Memory')}
    <div class="center game">
      <div class="mascot-wrap small"></div>
      <p class="lead">Zoek de twee dezelfde!</p>
      <div class="memory-grid cols-${cards === 6 ? 3 : 4}">
        ${deck.map((s, i) => `
          <button class="mcard" data-i="${i}" aria-label="Kaartje ${i + 1}">
            <span class="mcard-inner">
              <span class="mcard-back">⭐</span>
              <span class="mcard-front">${s.svg}</span>
            </span>
          </button>`).join('')}
      </div>
    </div>
  `);
  bindBack();
  const m = mascot();
  say('Zoek de twee dezelfde plaatjes!');

  let open = [];
  let matched = 0;
  let misses = 0;
  let lock = false;

  $$('.mcard').forEach((card) =>
    card.addEventListener('click', async () => {
      const i = Number(card.dataset.i);
      if (lock || card.classList.contains('open')) return;
      card.classList.add('open');
      card.setAttribute('aria-label', deck[i].name);
      say(deck[i].name);
      open.push(card);
      if (open.length < 2) return;

      const [a, b] = open;
      open = [];
      if (deck[a.dataset.i].id === deck[b.dataset.i].id) {
        a.classList.add('matched');
        b.classList.add('matched');
        soundCorrect();
        m.react('happy');
        matched++;
        if (matched === pairs) {
          await wait(1100);
          if (isCurrent(id)) kleuterResultaat('memory', misses <= pairs);
        }
        return;
      }
      misses++;
      lock = true;
      await wait(1300);
      if (!isCurrent(id)) return;
      for (const c of [a, b]) {
        c.classList.remove('open');
        c.setAttribute('aria-label', `Kaartje ${Number(c.dataset.i) + 1}`);
      }
      lock = false;
    }),
  );
}

function kleuren() {
  const QUESTIONS = 5;
  const id = render(`
    ${topbar('Kleuren en vormen')}
    <div class="center game">
      <div class="steps">${'<span></span>'.repeat(QUESTIONS)}</div>
      <div class="mascot-wrap small"></div>
      <p class="lead prompt"></p>
      <div class="shape-grid"></div>
      <button class="btn" id="repeat">🔁 Nog eens horen</button>
    </div>
  `);
  bindBack();
  const m = mascot();
  let index = 0;
  let perfect = true;
  let question = null;

  function ask() {
    question = makeShapeQuestion();
    let busy = false;
    $$('.steps span').forEach((dot, i) => dot.classList.toggle('done', i < index));
    $('.prompt').textContent = question.prompt;
    $('.shape-grid').innerHTML = question.items
      .map((item, i) => `<button class="shape-btn" data-i="${i}" style="--i:${i}"
          aria-label="${item.colour} ${item.shape}">${shapeSVG(item.shape, COLOURS.find((c) => c.id === item.colour).hex)}</button>`)
      .join('');
    say(question.prompt);
    $$('.shape-btn').forEach((btn) =>
      btn.addEventListener('click', async () => {
        if (busy || btn.disabled) return;
        if (!question.items[Number(btn.dataset.i)].target) {
          perfect = false;
          btn.disabled = true;
          btn.classList.add('nope');
          m.react('encourage');
          say(`Probeer nog eens. ${question.prompt}`);
          return;
        }
        busy = true;
        btn.classList.add('right');
        soundCorrect();
        m.react('happy');
        await say('Goed zo!');
        await wait(300);
        if (!isCurrent(id)) return;
        index++;
        if (index >= QUESTIONS) kleuterResultaat('kleuren', perfect);
        else ask();
      }),
    );
  }
  $('#repeat').addEventListener('click', () => question && say(question.prompt));
  ask();
}

function mijnNaam() {
  const game = makeNameGame(child().name);
  if (!game) {
    render(`
      ${topbar('Mijn naam')}
      <div class="center">
        <div class="mascot-wrap"></div>
        <p class="lead">Ik ken je naam nog niet!</p>
        <p class="hint">Vraag een grote om je naam in te vullen bij ⚙️ Instellingen → Kinderen.</p>
      </div>
    `);
    bindBack();
    mascot();
    say('Ik ken je naam nog niet! Vraag een grote om je naam in te vullen.');
    return;
  }

  const id = render(`
    ${topbar('Mijn naam')}
    <div class="center game">
      <div class="steps">${'<span></span>'.repeat(3)}</div>
      <div class="mascot-wrap small"></div>
      <p class="lead prompt"></p>
      <div class="name-step"></div>
      <button class="btn" id="repeat">🔁 Nog eens horen</button>
    </div>
  `);
  bindBack();
  const m = mascot();
  let perfect = true;
  let spoken = '';
  const ask = (text) => {
    spoken = text;
    $('.prompt').textContent = text;
    say(text);
  };
  const setStep = (n) => $$('.steps span').forEach((dot, i) => dot.classList.toggle('done', i < n));
  const miss = (btn, retry) => {
    perfect = false;
    btn.disabled = true;
    btn.classList.add('nope');
    m.react('encourage');
    say(`Probeer nog eens. ${retry}`);
  };
  const success = async (text) => {
    soundCorrect();
    m.react('happy');
    await say(text);
    await wait(300);
    return isCurrent(id);
  };

  // 1. Which name is yours?
  function stepNames() {
    setStep(0);
    ask('Welke naam is van jou?');
    $('.name-step').innerHTML = `<div class="choices">${game.names
      .map((n) => `<button class="choice name-card" data-name="${escape(n)}">${escape(n)}</button>`).join('')}</div>`;
    let busy = false;
    $$('.name-card').forEach((btn) =>
      btn.addEventListener('click', async () => {
        if (busy || btn.disabled) return;
        if (btn.dataset.name !== game.name) return miss(btn, 'Welke naam is van jou?');
        busy = true;
        btn.classList.add('right');
        if (await success(`Ja! Dat is jouw naam: ${game.name}.`)) stepFirst();
      }),
    );
  }

  // 2. Which letter does your name start with?
  function stepFirst() {
    setStep(1);
    ask('Met welke letter begint jouw naam?');
    $('.name-step').innerHTML = `
      <p class="name-show">${escape(game.name)}</p>
      <div class="choices">${game.firstOptions
        .map((l) => `<button class="choice letter-card" data-letter="${escape(l)}">${escape(l)}</button>`).join('')}</div>`;
    let busy = false;
    $$('.letter-card').forEach((btn) =>
      btn.addEventListener('click', async () => {
        if (busy || btn.disabled) return;
        if (btn.dataset.letter !== game.first) return miss(btn, 'Met welke letter begint jouw naam?');
        busy = true;
        btn.classList.add('right');
        if (await success(`Ja! ${game.name} begint met de letter ${game.first}.`)) stepBuild();
      }),
    );
  }

  // 3. Put your name together.
  function stepBuild() {
    setStep(2);
    ask('Leg je naam! Tik op de letters, van links naar rechts.');
    $('.name-step').innerHTML = `
      <div class="name-slots">${game.letters.map((l) => `<span class="slot">${escape(l)}</span>`).join('')}</div>
      <div class="choices tiles">${game.tiles
        .map((t) => `<button class="choice letter-card tile-letter" data-letter="${escape(t.letter)}">${escape(t.letter)}</button>`).join('')}</div>`;
    let next = 0;
    let busy = false;
    $$('.tile-letter').forEach((btn) =>
      btn.addEventListener('click', async () => {
        if (busy || btn.disabled) return;
        if (btn.dataset.letter !== game.letters[next]) {
          perfect = false;
          btn.classList.remove('wiggle');
          void btn.offsetWidth;
          btn.classList.add('wiggle');
          say('Die komt nog niet. Welke letter komt nu?');
          return;
        }
        btn.disabled = true;
        btn.classList.add('used');
        $$('.slot')[next].classList.add('filled');
        next++;
        if (next < game.letters.length) return;
        busy = true;
        setStep(3);
        if (await success(`Goed zo! Zo schrijf je ${game.name}.`)) kleuterResultaat('mijnNaam', perfect);
      }),
    );
  }

  $('#repeat').addEventListener('click', () => spoken && say(spoken));
  stepNames();
}

function kleuterResultaat(again, perfect) {
  render(`
    ${topbar('Klaar!')}
    <div class="center">
      <div class="mascot-wrap"></div>
      <p class="score rainbow-text">Goed gedaan!</p>
      <div class="reward"></div>
      <div class="row">
        <button class="btn primary big" id="again">Nog eens</button>
        <button class="btn mint big" id="home">🏠 Naar het begin</button>
      </div>
    </div>
  `);
  bindBack();
  const m = mascot();
  setTimeout(() => m.react('happy'), 250);
  giveSticker(perfect, m);
  if ($('.envelope')) say('Goed gedaan! Tik op de envelop.');
  $('#again').addEventListener('click', () => go(again));
  $('#home').addEventListener('click', () => go('home'));
}

// ---------- Help ----------

// Short, child-friendly explanations.
const HELP = [
  {
    icon: '✏️',
    title: 'Dictee',
    text: `Kies een woordpakket, of “Gemengd” voor woordjes uit alle pakketten.
      Neem je blad en je potlood. De eenhoorn zegt een woord, en jij schrijft het op.
      Zeg “klaar” als je het geschreven hebt. Wil je het nog eens horen? Zeg “wablieft?”.
      Op het einde kijk je je blad na: tik op het kruisje bij een fout.`,
  },
  {
    icon: '🔢',
    title: 'Rekenen',
    text: `De eenhoorn zegt een som. Zeg het antwoord hardop, of typ het en tik op OK.
      Was het fout? Dan mag je nog een keer proberen.`,
  },
  {
    icon: '🎤',
    title: 'Praten met de app',
    text: `Als je het groene bolletje ziet bij “Ik luister”, mag je praten.
      Zeg “klaar”, “ja”, “oké” of “volgende” om verder te gaan.
      Zeg “wablieft?”, “wat?” of “zeg nog eens” om het nog eens te horen.
      Werkt praten niet? Dan kan je altijd de knoppen gebruiken.`,
  },
  {
    icon: '📒',
    title: 'Stickers',
    text: `Na elk dictee en elke rekenronde krijg je een envelop met een sticker.
      Alles juist? Dan krijg je een glittersticker.
      Is een pagina in je stickerboek vol, dan krijgt je eenhoorn een verrassing.
      Bij “Mijn eenhoorn” kies je wat je eenhoorn bij zich heeft.`,
  },
];

function help() {
  render(`
    ${topbar('Hoe werkt het?')}
    <div class="settings">
      ${HELP.map((part, i) => `
        <div class="card help-card" style="--i:${i}">
          <h2>${part.icon} ${escape(part.title)}</h2>
          <p>${escape(part.text.replace(/\s+/g, ' '))}</p>
        </div>`).join('')}
      <div class="card help-card">
        <h2>🧑‍🧒 Voor ouders</h2>
        <p>Bij ⚙️ Instellingen kies je de woordpakketten, de soort sommen, de naam, de stem en de geluidjes.
          Je kan er ook de woordjes zelf inspreken, en je opnames bewaren in een reservekopie.</p>
      </div>
    </div>
  `);
  bindBack();
}

// ---------- Sticker book ----------

const stickerCount = () => Object.keys(book.stickers).length;

function findSticker(id) {
  for (const page of STICKER_PAGES) {
    const sticker = page.stickers.find((s) => s.id === id);
    if (sticker) return { page, sticker };
  }
  return null;
}

const accessoryFor = (pageId) => ACCESSORIES.find((acc) => acc.page === pageId);

const stickerTile = (sticker, glitter) =>
  `<div class="sticker${glitter ? ' glitter' : ''}">${sticker.svg}</div>`;

/**
 * Awards the round's sticker straight away (so leaving early doesn't lose
 * it) and shows an envelope to tap open.
 */
function giveSticker(perfect, m) {
  const id = screenId;
  const result = award(book, STICKER_PAGES, { glitter: perfect });
  const box = $('.reward');
  if (!result.sticker) {
    box.innerHTML = '<p class="hint">Je stickerboek is helemaal vol! 🌈</p>';
    return;
  }
  book = result.book;
  saveBook(book, bookKey());
  const { page, sticker } = findSticker(result.sticker.id);
  const acc = result.completedPage && accessoryFor(result.completedPage);

  box.innerHTML = `
    <button class="envelope" aria-label="Open je envelop">💌</button>
    <p class="hint">Je verdiende een sticker! Tik op de envelop.</p>`;
  box.querySelector('.envelope').addEventListener('click', () => {
    if (!isCurrent(id)) return;
    box.innerHTML = `
      <div class="reveal">
        ${stickerTile(sticker, result.sticker.glitter)}
        <p class="lead">Je kreeg <b>${escape(sticker.name)}</b>!</p>
        ${result.sticker.glitter ? '<p class="hint">✨ Een glittersticker, omdat alles juist was!</p>' : ''}
        ${acc ? `<p class="lead unlock">De pagina ${escape(page.title)} is vol! Je eenhoorn krijgt <b>${escape(acc.name)}</b>.</p>` : ''}
        <button class="btn ${acc ? 'primary' : ''}" id="reward-go">${acc ? '🦄 Naar je eenhoorn' : '📒 Naar je stickerboek'}</button>
      </div>`;
    soundCorrect();
    m.react('happy');
    if (child().kind === 'kleuter') say(`Je kreeg ${sticker.name}!`);
    $('#reward-go').addEventListener('click', () => (acc ? go('aankleden') : go('stickerboek', page.id)));
  });
}

function stickerboek(pageId) {
  const startPage =
    STICKER_PAGES.find((p) => p.id === pageId) ||
    STICKER_PAGES.find((p) => !isPageComplete(book, p)) ||
    STICKER_PAGES[0];
  render(`
    ${topbar('Stickerboek')}
    <div class="explain">
      <p>Na ${child().kind === 'kleuter' ? 'elk <b>spelletje</b>' : 'elk <b>dictee</b> en elke <b>rekenronde</b>'} krijg je een envelop met een sticker.
        Alles juist? Dan is je sticker een <b>glittersticker</b> ✨.
        Is een pagina vol, dan krijgt je eenhoorn een <b>verrassing</b>!</p>
    </div>
    <div class="chips page-tabs" role="tablist"></div>
    <div class="card album-page">
      <div class="sticker-grid"></div>
      <div class="page-reward"></div>
    </div>
    <div class="row"><button class="btn primary big" id="to-wardrobe">🦄 Mijn eenhoorn</button></div>
  `);
  bindBack();

  function showPage(page) {
    $('.page-tabs').innerHTML = STICKER_PAGES.map((p) => {
      const count = p.stickers.filter((s) => book.stickers[s.id]).length;
      return `<button class="chip${isPageComplete(book, p) ? ' done' : ''}" role="tab" data-page="${p.id}"
        aria-pressed="${p.id === page.id}">${escape(p.title)} ${count}/${p.stickers.length}</button>`;
    }).join('');
    $('.sticker-grid').innerHTML = page.stickers
      .map((s, i) => {
        const got = book.stickers[s.id];
        return got
          ? `<figure style="--i:${i}">${stickerTile(s, got.glitter)}<figcaption>${escape(s.name)}</figcaption></figure>`
          : `<figure style="--i:${i}"><div class="sticker empty">?</div><figcaption>&nbsp;</figcaption></figure>`;
      })
      .join('');
    const acc = accessoryFor(page.id);
    const full = isPageComplete(book, page);
    $('.page-reward').innerHTML = acc
      ? `<div class="acc-icon${full ? '' : ' locked'}">${ACCESSORY_ICONS[acc.id]}</div>
         <p>${full ? `Pagina vol! Je eenhoorn kreeg <b>${escape(acc.name)}</b>.` : `Maak de pagina vol, dan krijgt je eenhoorn <b>${escape(acc.name)}</b>.`}</p>`
      : '';
    $$('.page-tabs .chip').forEach((chip) =>
      chip.addEventListener('click', () => showPage(STICKER_PAGES.find((p) => p.id === chip.dataset.page))),
    );
  }

  $('#to-wardrobe').addEventListener('click', () => go('aankleden'));
  showPage(startPage);
}

function aankleden() {
  render(`
    ${topbar('Mijn eenhoorn', 'stickerboek')}
    <div class="center">
      <div class="mascot-wrap big"></div>
      <div class="wardrobe"></div>
      <p class="hint" id="wardrobe-hint"></p>
    </div>
  `);
  bindBack();
  const m = mascot();

  function show() {
    const unlocked = unlockedAccessories(book, STICKER_PAGES, ACCESSORIES);
    $('.wardrobe').innerHTML = ACCESSORIES.map((acc) => {
      const open = unlocked.includes(acc.id);
      const page = STICKER_PAGES.find((p) => p.id === acc.page);
      return `<button class="wardrobe-item${open ? '' : ' locked'}" data-acc="${acc.id}"
          aria-pressed="${book.worn.includes(acc.id)}" ${open ? '' : 'aria-disabled="true"'}>
        <span class="acc-icon">${ACCESSORY_ICONS[acc.id]}</span>
        <span>${open ? escape(acc.name) : `🔒 ${escape(page.title)}`}</span>
      </button>`;
    }).join('');
    $('#wardrobe-hint').textContent = unlocked.length
      ? 'Tik om iets bij je eenhoorn te zetten of weg te halen.'
      : 'Maak een stickerpagina vol, dan krijgt je eenhoorn een verrassing!';
    $$('.wardrobe-item').forEach((btn) =>
      btn.addEventListener('click', () => {
        const acc = ACCESSORIES.find((a) => a.id === btn.dataset.acc);
        if (!unlocked.includes(acc.id)) {
          const page = STICKER_PAGES.find((p) => p.id === acc.page);
          $('#wardrobe-hint').textContent = `Maak eerst de pagina ${page.title} vol.`;
          return;
        }
        book = toggleWorn(book, acc.id, STICKER_PAGES, ACCESSORIES);
        saveBook(book, bookKey());
        m.wear(book.worn);
        if (book.worn.includes(acc.id)) m.react('happy');
        show();
      }),
    );
  }
  show();
}

// ---------- Recording words in a parent's voice ----------

/** Unique words of a package, in the school's order, as spoken. */
function packageWords(packageId) {
  const seen = new Set();
  return (pakketten[packageId] || []).map(spokenForm).filter((spoken) => {
    const key = recordingKey(spoken);
    return !seen.has(key) && seen.add(key);
  });
}

function allWordKeys() {
  return new Set(Object.keys(pakketten).flatMap((packageId) => packageWords(packageId).map(recordingKey)));
}

async function inspreken(packageId) {
  const ids = Object.keys(pakketten).map(Number);
  const id = render(`
    ${topbar('Woorden inspreken', 'instellingen')}
    <div class="settings">
      <div class="card">
        <h2>Kies een pakket</h2>
        <p>Groen = alle woordjes ingesproken.</p>
        <div class="chips" id="rec-packages"></div>
      </div>
      <div class="card record-card">
        <p class="counter"></p>
        <p class="record-word"></p>
        <p class="record-status" aria-live="polite"></p>
        <div class="row">
          <button class="icon-btn" id="rec-prev" aria-label="Vorig woord">⬅️</button>
          <button class="btn primary big" id="rec-toggle">🎙️ Opnemen</button>
          <button class="icon-btn" id="rec-play" aria-label="Beluisteren">▶️</button>
          <button class="icon-btn" id="rec-next" aria-label="Volgend woord">➡️</button>
        </div>
        <p class="hint">Tik op <b>Opnemen</b>, zeg het woord, en tik op <b>Stop</b>.
          Je hoort de opname meteen terug en gaat dan naar het volgende woord.</p>
      </div>
    </div>
  `);
  bindBack();

  if (!canRecord()) {
    $('.record-card').innerHTML = '<p class="note">Opnemen werkt niet in deze browser.</p>';
    return;
  }

  const recorder = new Recorder();
  onLeave(() => recorder.close());

  let keys = await recordedKeys();
  if (!isCurrent(id)) return;

  const isComplete = (pid) => packageWords(pid).every((spoken) => keys.has(recordingKey(spoken)));
  let current = Number(packageId) || ids.find((pid) => settings.enabledPackages.includes(pid) && !isComplete(pid)) || ids[0];
  let words = [];
  let index = 0;
  let take = null; // The recording in progress.
  let starting = false; // Waiting for the microphone to open.
  let step = 0; // Bumped on every navigation; stale playbacks must not advance.

  const word = () => words[index];
  const status = (text) => { $('.record-status').textContent = text; };

  function renderPackages() {
    $('#rec-packages').innerHTML = ids
      .map((pid) => `<button class="chip${isComplete(pid) ? ' done' : ''}" data-value="${pid}"
        aria-pressed="${pid === current}">${pid}</button>`)
      .join('');
  }

  function show() {
    const recorded = keys.has(recordingKey(word()));
    const count = words.filter((spoken) => keys.has(recordingKey(spoken))).length;
    $('.counter').textContent = `Pakket ${current} · woord ${index + 1} van ${words.length} · ${count} ingesproken`;
    $('.record-word').textContent = word();
    $('.record-word').classList.toggle('recorded', recorded);
    status(recorded ? '✓ Al ingesproken. Tik op Opnemen om het opnieuw te doen.' : '');
    $('#rec-play').disabled = !recorded;
    $('#rec-prev').disabled = index === 0;
    $('#rec-next').disabled = index === words.length - 1;
  }

  function openPackage(pid) {
    current = pid;
    words = packageWords(pid);
    const firstOpen = words.findIndex((spoken) => !keys.has(recordingKey(spoken)));
    index = firstOpen === -1 ? 0 : firstOpen;
    renderPackages();
    goTo(index);
  }

  function goTo(i) {
    if (take) return;
    step++;
    stopPlayback();
    index = Math.max(0, Math.min(words.length - 1, i));
    show();
  }

  async function play() {
    const url = (await loadUrls([word()])).get(recordingKey(word()));
    if (!url || !isCurrent(id)) return;
    await playUrl(url);
    URL.revokeObjectURL(url);
  }

  async function toggle() {
    const button = $('#rec-toggle');
    if (take) {
      // Stop and save. Clear `take` first so the auto-stop handler below
      // doesn't save the same recording a second time.
      const finished = take;
      take = null;
      const blob = await finished.stop();
      button.textContent = '🎙️ Opnemen';
      button.classList.remove('recording');
      if (!isCurrent(id)) return;
      if (blob.size < 800) return status('Dat was te kort. Probeer opnieuw.');
      const spoken = word();
      await saveRecording(spoken, blob);
      keys.add(recordingKey(spoken));
      renderPackages();
      show();
      status('✓ Opgeslagen.');
      const mine = ++step;
      await play();
      if (!isCurrent(id) || mine !== step) return;
      if (index < words.length - 1) {
        await wait(350);
        if (isCurrent(id) && mine === step) goTo(index + 1);
      } else {
        status(isComplete(current) ? `🎉 Pakket ${current} is klaar!` : '✓ Opgeslagen. Er zijn nog woordjes zonder opname.');
      }
      return;
    }

    // Start recording. Ignore taps while the microphone is still opening.
    if (starting) return;
    starting = true;
    step++;
    stopPlayback();
    let started;
    try {
      started = await recorder.record({ maxMs: 6000 });
    } catch {
      return status('De microfoon mag niet. Sta de microfoon toe in de instellingen van Safari.');
    } finally {
      starting = false;
    }
    if (!isCurrent(id)) return started.stop();
    take = started;
    button.textContent = '⏹️ Stop';
    button.classList.add('recording');
    status('Spreek het woord in…');
    // Auto-stop after 6 seconds also saves.
    started.done.then(() => take === started && isCurrent(id) && toggle());
  }

  $('#rec-packages').addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (chip && !take) openPackage(Number(chip.dataset.value));
  });
  $('#rec-toggle').addEventListener('click', toggle);
  $('#rec-play').addEventListener('click', () => { step++; play(); });
  $('#rec-prev').addEventListener('click', () => goTo(index - 1));
  $('#rec-next').addEventListener('click', () => goTo(index + 1));

  openPackage(current);
}

// ---------- Start ----------

async function start() {
  preloadVoices();
  try {
    const response = await fetch('data/woordpakketten.json');
    pakketten = (await response.json()).pakketten;
  } catch {
    app.innerHTML = '<p class="lead" style="text-align:center;margin-top:30vh">De woordjes konden niet geladen worden. Probeer opnieuw.</p>';
    return;
  }
  home();
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

if (['localhost', '127.0.0.1'].includes(location.hostname)) window.simulateSpeech = simulateSpeech;

start();
