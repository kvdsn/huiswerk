import { loadSettings, saveSettings } from './settings.js';
import {
  speak, stopSpeaking, flemishVoiceInfo, preloadVoices, Listener, canListen, simulateSpeech, speechDiagnostics, watchSpeechLog,
} from './speech.js';
import { matchCommandInAlternatives } from './logic/commands.js';
import { buildRound, displayForm, spokenForm } from './logic/words.js';
import { makeQuestions, checkAnswer } from './logic/math.js';
import { mountMascot } from './ui/mascot.js';
import {
  recordingKey, saveRecording, recordedKeys, loadUrls, revokeUrls, playUrl, stopPlayback, canRecord, Recorder,
} from './recordings.js';

const app = document.getElementById('app');
let settings = loadSettings();
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

// "Hoi <naam>!" — the name is set in Instellingen and only stored on the device.
const greeting = () => (settings.name.trim() ? `Hoi ${settings.name.trim()}!` : 'Hoi!');

function mascot(selector = '.mascot-wrap') {
  const el = $(selector);
  return el ? mountMascot(el) : { react() {} };
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
  const screens = { home, dicteeKies, rekenenStart, instellingen, inspreken };
  (screens[name] || home)(...args);
}

const MIC_TEXT = {
  listening: 'Ik luister…',
  idle: 'Even wachten…',
  denied: 'De microfoon mag niet. Gebruik de knoppen.',
  unavailable: 'Praten werkt hier niet (staat Dicteren aan?). Gebruik de knoppen.',
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
  render(`
    <header class="topbar">
      <span class="spacer"></span>
      <h1></h1>
      <button class="icon-btn" id="to-settings" aria-label="Instellingen">⚙️</button>
    </header>
    <div class="center">
      <div class="mascot-wrap"></div>
      <h2 class="hello rainbow-text">${escape(greeting())}</h2>
      <p class="lead">Wat gaan we vandaag oefenen?</p>
      <div class="menu">
        <button class="tile pink" id="to-dictee" style="--i:0">
          <span class="emoji">✏️</span>Dictee<small>Woordjes schrijven</small>
        </button>
        <button class="tile mint" id="to-rekenen" style="--i:1">
          <span class="emoji">🔢</span>Rekenen<small>Sommen zeggen</small>
        </button>
      </div>
    </div>
  `);
  mascot();
  $('#to-dictee').addEventListener('click', () => go('dicteeKies'));
  $('#to-rekenen').addEventListener('click', () => go('rekenenStart'));
  $('#to-settings').addEventListener('click', () => go('instellingen'));
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
    yes.addEventListener('click', () => set(false));
    no.addEventListener('click', () => set(true));
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
      await wait(1000);
      return isCurrent(id) && advance();
    }

    tries++;
    m.react('encourage');
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
      <div class="row">
        <button class="btn primary big" id="again">Nog eens</button>
        <button class="btn mint big" id="home">🏠 Naar het begin</button>
      </div>
    </div>
  `);
  bindBack();
  const m = mascot();
  setTimeout(() => m.react(score >= total * 0.8 ? 'happy' : 'encourage'), 250);
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
        <h2>🦄 Naam</h2>
        <p>Zo begroet de eenhoorn je. De naam blijft op dit toestel.</p>
        <div class="field">
          <input id="name" type="text" maxlength="20" autocomplete="off" aria-label="Naam" value="${escape(settings.name)}">
        </div>
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
      </div>
    </div>
  `);
  bindBack();

  const update = (change) => {
    change(settings);
    saveSettings(settings);
  };

  const toggleIn = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value].sort((a, b) => a - b));

  $$('.chips').forEach((group) => {
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
      }

      const pressed = {
        packages: (v) => settings.enabledPackages.includes(v),
        tables: (v) => settings.math.tables.includes(v),
        ops: (v) => settings.math.ops[v],
        max: (v) => settings.math.max === v,
        count: (v) => settings.math.count === v,
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

  $('#name').addEventListener('input', (event) => update((s) => { s.name = event.target.value; }));
  select.addEventListener('change', () => update((s) => { s.voiceURI = select.value; }));
  $('#rate').addEventListener('input', (event) => update((s) => { s.rate = Number(event.target.value); }));
  $('#test-voice').addEventListener('click', () => say(`${greeting()} Het woord is: de regenboog.`));
  $('#to-record').addEventListener('click', () => go('inspreken'));
  const total = allWordKeys();
  const keys = await recordedKeys();
  if (isCurrent(id)) {
    const done = [...total].filter((key) => keys.has(key)).length;
    $('#rec-count').textContent = `${done} van ${total.size} woordjes ingesproken.`;
  }
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

    // Start recording.
    step++;
    stopPlayback();
    try {
      await recorder.open();
    } catch {
      return status('De microfoon mag niet. Sta de microfoon toe in de instellingen van Safari.');
    }
    if (!isCurrent(id)) return;
    take = recorder.record({ maxMs: 6000 });
    button.textContent = '⏹️ Stop';
    button.classList.add('recording');
    status('Spreek het woord in…');
    // Auto-stop after 6 seconds also saves.
    take.done.then(() => take && isCurrent(id) && toggle());
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
