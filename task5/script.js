"use strict";

/* ---------- DOM ---------- */
const pads = Array.from(document.querySelectorAll(".pad"));
const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");
const levelEl = document.getElementById("level");
const bestEl = document.getElementById("best");

/* ---------- Состояние игры ---------- */
const state = {
  sequence: [],        // последовательность, которую нужно повторить
  playerInput: [],     // ввод игрока в текущем раунде
  level: 0,            // текущий уровень (длина последовательности)
  best: 0,             // рекорд
  isShowing: false,    // идёт ли показ последовательности компьютером
  isPlaying: false,    // идёт ли игра вообще
  timers: [],          // все активные setTimeout-иды (для очистки)
};

/* ---------- Звук (AudioContext, без внешних файлов) ---------- */
let audioCtx = null;

// разные частоты для каждой кнопки
const PAD_FREQS = [329.63, 261.63, 392.0, 196.0]; // E4, C4, G4, G3
const ERROR_FREQ = 110.0;
const WIN_FREQ = 523.25;

function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playTone(freq, duration = 0.35, type = "sine") {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playPadSound(index) {
  playTone(PAD_FREQS[index], 0.35, "sine");
}

function playErrorSound() {
  playTone(ERROR_FREQ, 0.6, "sawtooth");
}

function playWinSound() {
  playTone(WIN_FREQ, 0.25, "triangle");
  // небольшая задержка для «победного» аккорда
  setTimeout(() => playTone(WIN_FREQ * 1.25, 0.25, "triangle"), 130);
  setTimeout(() => playTone(WIN_FREQ * 1.5, 0.3, "triangle"), 260);
}

/* ---------- Таймеры ---------- */
function clearAllTimers() {
  state.timers.forEach((id) => clearTimeout(id));
  state.timers = [];
}

function schedule(fn, delay) {
  const id = setTimeout(() => {
    // удаляем себя из списка после выполнения
    state.timers = state.timers.filter((t) => t !== id);
    fn();
  }, delay);
  state.timers.push(id);
  return id;
}

/* ---------- Управление кнопками ---------- */
function setPadsDisabled(disabled) {
  pads.forEach((p) => { p.disabled = disabled; });
}

function flashPad(index) {
  const pad = pads[index];
  pad.classList.add("active");
  schedule(() => pad.classList.remove("active"), 380);
}

/* ---------- Показ последовательности ---------- */
function showSequence() {
  state.isShowing = true;
  state.playerInput = [];
  setPadsDisabled(true);
  statusEl.textContent = "Смотри…";

  const STEP_DELAY = 620; // пауза между вспышками
  const START_DELAY = 450;

  state.sequence.forEach((padIndex, i) => {
    schedule(() => {
      flashPad(padIndex);
      playPadSound(padIndex);
    }, START_DELAY + i * STEP_DELAY);
  });

  // после показа — разрешаем ввод
  const totalTime = START_DELAY + state.sequence.length * STEP_DELAY + 100;
  schedule(() => {
    state.isShowing = false;
    setPadsDisabled(false);
    statusEl.textContent = "Твой ход";
  }, totalTime);
}

/* ---------- Раунды ---------- */
function nextRound() {
  state.level = state.sequence.length + 1;
  levelEl.textContent = state.level;

  const randomIndex = Math.floor(Math.random() * 4);
  state.sequence.push(randomIndex);

  showSequence();
}

function startGame() {
  ensureAudio();
  clearAllTimers();

  state.sequence = [];
  state.playerInput = [];
  state.level = 0;
  state.isShowing = false;
  state.isPlaying = true;

  levelEl.textContent = "0";
  startBtn.disabled = true;
  statusEl.textContent = "Приготовься…";

  // небольшая задержка перед первым раундом
  schedule(() => nextRound(), 500);
}

function endGame(reason) {
  state.isPlaying = false;
  state.isShowing = false;
  clearAllTimers();
  setPadsDisabled(true);
  startBtn.disabled = false;

  if (reason === "win") {
    statusEl.textContent = "Победа! Все 4 сектора угаданы!";
  } else if (reason === "error") {
    statusEl.textContent = `Ошибка! Вы дошли до уровня ${state.level}`;
    playErrorSound();
  }

  if (state.level > state.best) {
    state.best = state.level;
    bestEl.textContent = state.best;
  }
}

/* ---------- Ввод игрока ---------- */
function handlePadClick(index) {
  if (!state.isPlaying || state.isShowing) return;

  playPadSound(index);
  flashPad(index);

  state.playerInput.push(index);
  const step = state.playerInput.length - 1;

  // проверяем текущий шаг
  if (state.playerInput[step] !== state.sequence[step]) {
    endGame("error");
    return;
  }

  // игрок полностью повторил последовательность
  if (state.playerInput.length === state.sequence.length) {
    state.isShowing = true;
    setPadsDisabled(true);
    statusEl.textContent = "Верно! Следующий уровень…";
    playWinSound();

    schedule(() => {
      if (state.level >= 8) {
        endGame("win");
      } else {
        nextRound();
      }
    }, 900);
  }
}

/* ---------- Обработчики ---------- */
pads.forEach((pad) => {
  pad.addEventListener("click", () => {
    const index = Number(pad.dataset.index);
    handlePadClick(index);
  });
});

startBtn.addEventListener("click", startGame);

// при уходе со страницы — чистим таймеры
window.addEventListener("beforeunload", clearAllTimers);