'use strict';

const COLS = 20;
const ROWS = 20;
const CELL = 30;
const MOVE_INTERVAL = 150;

const DIRS = {
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1  },
  left:  { x: -1, y: 0  },
  right: { x: 1,  y: 0  },
};

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;

const scoreEl     = document.getElementById('score');
const bestEl      = document.getElementById('best');
const overlayEl   = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText  = document.getElementById('overlayText');
const startBtn    = document.getElementById('startBtn');

const state = {
  snake: [],
  dir: DIRS.right,
  nextDir: DIRS.right,
  apple: { x: 0, y: 0 },
  score: 0,
  best: Number(localStorage.getItem('snake_best') || 0),
  gameOver: false,
  paused: false,
  running: false,
};

let lastMoveTime = 0;
let rafId = null;

function resetState() {
  const midY = Math.floor(ROWS / 2);
  state.snake = [
    { x: 5, y: midY },
    { x: 4, y: midY },
    { x: 3, y: midY },
  ];
  state.dir = DIRS.right;
  state.nextDir = DIRS.right;
  state.score = 0;
  state.gameOver = false;
  state.paused = false;
  state.running = true;
  lastMoveTime = performance.now();
  scoreEl.textContent = '0';
  bestEl.textContent = String(state.best);
  spawnApple();
}

function showOverlay(title, text, btnLabel) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  startBtn.textContent = btnLabel;
  overlayEl.classList.remove('is-hidden');
}

function hideOverlay() {
  overlayEl.classList.add('is-hidden');
}

function startGame() {
  resetState();
  hideOverlay();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function spawnApple() {
  const free = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!state.snake.some((s) => s.x === x && s.y === y)) {
        free.push({ x, y });
      }
    }
  }
  if (free.length === 0) {
    state.gameOver = true;
    return;
  }
  state.apple = free[Math.floor(Math.random() * free.length)];
}

function checkCollision(head) {
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return true;
  for (let i = 1; i < state.snake.length; i++) {
    if (state.snake[i].x === head.x && state.snake[i].y === head.y) return true;
  }
  return false;
}

function moveSnake() {
  state.dir = state.nextDir;

  const head = state.snake[0];
  const next = { x: head.x + state.dir.x, y: head.y + state.dir.y };

  if (checkCollision(next)) {
    gameOver();
    return;
  }

  state.snake.unshift(next);

  if (next.x === state.apple.x && next.y === state.apple.y) {
    state.score += 1;
    scoreEl.textContent = String(state.score);
    if (state.score > state.best) {
      state.best = state.score;
      bestEl.textContent = String(state.best);
      localStorage.setItem('snake_best', String(state.best));
    }
    spawnApple();
    if (state.gameOver) {
      state.running = false;
      showOverlay('Победа!', `Вы заполнили всё поле. Счёт: ${state.score}`, 'Играть снова');
    }
  } else {
    state.snake.pop();
  }
}

function gameOver() {
  state.gameOver = true;
  state.running = false;
  showOverlay('Игра окончена', `Итоговый счёт: ${state.score}`, 'Начать заново');
}

function loop(now) {
  if (!state.running) return;

  const delta = now - lastMoveTime;

  if (!state.paused && delta >= MOVE_INTERVAL) {
    lastMoveTime = now;
    update();
  }

  draw();

  if (state.running) {
    rafId = requestAnimationFrame(loop);
  }
}

function update() {
  moveSnake();
}

function draw() {
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1f2630';
  ctx.lineWidth = 1;
  for (let x = 1; x < COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL + 0.5, 0);
    ctx.lineTo(x * CELL + 0.5, canvas.height);
    ctx.stroke();
  }
  for (let y = 1; y < ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL + 0.5);
    ctx.lineTo(canvas.width, y * CELL + 0.5);
    ctx.stroke();
  }

  const ax = state.apple.x * CELL + CELL / 2;
  const ay = state.apple.y * CELL + CELL / 2;
  ctx.fillStyle = '#f85149';
  ctx.beginPath();
  ctx.arc(ax, ay, CELL * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#56d364';
  ctx.fillRect(ax - 2, ay - CELL * 0.42, 4, 6);

  state.snake.forEach((seg, i) => {
    const px = seg.x * CELL;
    const py = seg.y * CELL;
    const pad = 2;
    ctx.fillStyle = i === 0 ? '#56d364' : '#3fb950';
    roundRect(ctx, px + pad, py + pad, CELL - pad * 2, CELL - pad * 2, 6);
    ctx.fill();

    if (i === 0) {
      ctx.fillStyle = '#04210c';
      const eye = CELL * 0.12;
      const cx = px + CELL / 2;
      const cy = py + CELL / 2;
      const dx = state.dir.x * CELL * 0.16;
      const dy = state.dir.y * CELL * 0.16;
      ctx.beginPath();
      ctx.arc(cx + dx - CELL * 0.1, cy + dy - CELL * 0.1, eye, 0, Math.PI * 2);
      ctx.arc(cx + dx + CELL * 0.1, cy + dy - CELL * 0.1, eye, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  if (state.paused && state.running) {
    ctx.fillStyle = 'rgba(14,17,22,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e6edf3';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

function setDirection(next) {
  if (next.x === -state.dir.x && next.y === -state.dir.y) return;
  state.nextDir = next;
}

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  if (['arrowup', 'w', 'ц'].includes(key))    { setDirection(DIRS.up);    e.preventDefault(); }
  if (['arrowdown', 's', 'ы'].includes(key))  { setDirection(DIRS.down);  e.preventDefault(); }
  if (['arrowleft', 'a', 'ф'].includes(key))  { setDirection(DIRS.left);  e.preventDefault(); }
  if (['arrowright', 'd', 'в'].includes(key)) { setDirection(DIRS.right); e.preventDefault(); }

  if (key === ' ' && state.running && !state.gameOver) {
    state.paused = !state.paused;
    e.preventDefault();
  }
  if (key === 'r') {
    startGame();
  }
});

startBtn.addEventListener('click', startGame);

bestEl.textContent = String(state.best);
resetState();
state.running = false;
state.snake = [];
draw();