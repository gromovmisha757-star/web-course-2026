"use strict";

const keys = Array.from(document.querySelectorAll(".key"));
const startBtn = document.getElementById("startBtn");
const screenColor = document.getElementById("screenColor");
const screenSub = document.getElementById("screenSub");
const levelEl = document.getElementById("level");
const bestEl = document.getElementById("best");

const state = {
  sequence: [],
  playerInput: [],
  level: 0,
  best: 0,
  isShowing: false,
  isPlaying: false,
  timers: [],
};

const KEY_COLORS = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE"];
const KEY_COUNT = 5;
const MAX_LEVEL = 8;

function clearAllTimers() {
  state.timers.forEach((id) => clearTimeout(id));
  state.timers = [];
}

function schedule(fn, delay) {
  const id = setTimeout(() => {
    state.timers = state.timers.filter((t) => t !== id);
    fn();
  }, delay);
  state.timers.push(id);
  return id;
}

function setScreen(colorText, subText) {
  screenColor.textContent = colorText;
  if (subText !== undefined) screenSub.textContent = subText;
  screenColor.classList.remove("pop");
  void screenColor.offsetWidth;
  screenColor.classList.add("pop");
}

function setKeysDisabled(disabled) {
  keys.forEach((k) => { k.disabled = disabled; });
}

function resetKeysVisual() {
  keys.forEach((k) => k.classList.remove("active"));
}

function flashKey(index, showOnScreen = true) {
  const el = keys[index];
  el.classList.add("active");
  if (showOnScreen) setScreen(KEY_COLORS[index]);
  schedule(() => el.classList.remove("active"), 420);
}

function showSequence() {
  state.isShowing = true;
  state.playerInput = [];
  setKeysDisabled(true);
  setScreen("WATCH", "смотри…");

  const STEP = 640;
  const START = 480;

  state.sequence.forEach((keyIndex, i) => {
    schedule(() => {
      flashKey(keyIndex);
    }, START + i * STEP);
  });

  const total = START + state.sequence.length * STEP + 120;
  schedule(() => {
    state.isShowing = false;
    setKeysDisabled(false);
    setScreen("YOUR TURN", "твой ход");
  }, total);
}

function nextRound() {
  state.level = state.sequence.length + 1;
  levelEl.textContent = state.level;

  const randomIndex = Math.floor(Math.random() * KEY_COUNT);
  state.sequence.push(randomIndex);

  showSequence();
}

function startGame() {
  clearAllTimers();
  resetKeysVisual();

  state.sequence = [];
  state.playerInput = [];
  state.level = 0;
  state.isShowing = false;
  state.isPlaying = true;

  levelEl.textContent = "0";
  setScreen("GET READY", "приготовься…");

  schedule(() => nextRound(), 600);
}

function endGame(reason) {
  state.isPlaying = false;
  state.isShowing = false;
  clearAllTimers();
  resetKeysVisual();
  setKeysDisabled(true);

  if (reason === "win") {
    setScreen("WINNER", "победа!");
  } else if (reason === "error") {
    setScreen("GAME OVER", `уровень ${state.level}`);
  }

  const reached = reason === "win" ? state.level : state.level - 1;
  if (reached > state.best) {
    state.best = reached;
    bestEl.textContent = state.best;
  }
}

function handleKeyPress(index) {
  if (!state.isPlaying || state.isShowing) return;

  flashKey(index);

  state.playerInput.push(index);
  const step = state.playerInput.length - 1;

  if (state.playerInput[step] !== state.sequence[step]) {
    endGame("error");
    return;
  }

  if (state.playerInput.length === state.sequence.length) {
    state.isShowing = true;
    setKeysDisabled(true);
    setScreen("CORRECT", "дальше…");

    schedule(() => {
      if (state.level >= MAX_LEVEL) endGame("win");
      else nextRound();
    }, 950);
  }
}

keys.forEach((key) => {
  key.addEventListener("click", () => {
    handleKeyPress(Number(key.dataset.index));
  });
});

startBtn.addEventListener("click", startGame);

window.addEventListener("beforeunload", clearAllTimers);