// 1. СОСТОЯНИЕ ИГРЫ
let secret = '';
let history = [];
let attempts = 0;
let isFinished = false;

// DOM-элементы
const input = document.getElementById('guess-input');
const message = document.getElementById('message');
const historyList = document.getElementById('history');
const attemptsEl = document.getElementById('attempts');

// 2. ЛОГИКА (по требованию лабы - отдельные функции)
function generateSecret() {
  const digits = ['0','1','2','3','4','5','6','7','8','9'];
  digits.sort(() => Math.random() - 0.5); // перемешиваем
  return digits.slice(0, 4).join('');
}

function validateInput(value) {
  if (!value) return 'Введите 4 цифры';
  if (!/^\d+$/.test(value)) return 'Разрешены только цифры';
  if (value.length !== 4) return 'Нужно ровно 4 цифры';
  if (new Set(value).size !== 4) return 'Цифры не должны повторяться';
  return null; // null значит "ошибок нет"
}

function countBullsAndCows(guess) {
  let bulls = 0, cows = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) bulls++;
    else if (secret.includes(guess[i])) cows++;
  }
  return { bulls, cows };
}

// 3. РЕНДЕР (из массива history)
function render() {
  attemptsEl.textContent = attempts;
  
  // Рендерим историю (переворачиваем, чтобы новые были сверху)
  historyList.innerHTML = history.map(item => `
    <li class="history__item">
      <span class="history__guess">${item.guess}</span>
      <span class="history__result">
        <strong>${item.bulls}</strong> бык(а), <strong>${item.cows}</strong> коров(а)
      </span>
    </li>
  `).reverse().join('');
}

// 4. УПРАВЛЕНИЕ ИГРОЙ
function showMessage(text, type) {
  message.textContent = text;
  message.className = 'game__message' + (type ? ` game__message--${type}` : '');
}

function startNewGame() {
  secret = generateSecret();
  history = [];
  attempts = 0;
  isFinished = false;
  
  input.disabled = false;
  input.value = '';
  input.focus();
  document.getElementById('check-btn').disabled = false;
  
  render();
  showMessage('Новая игра! Введите 4 цифры.', 'info');
}

function handleGuess() {
  if (isFinished) return;

  const value = input.value.trim();
  const error = validateInput(value);
  
  if (error) {
    showMessage(error, 'error');
    return;
  }

  const result = countBullsAndCows(value);
  history.push({ guess: value, bulls: result.bulls, cows: result.cows });
  attempts++;
  
  render();
  input.value = '';

  if (result.bulls === 4) {
    isFinished = true;
    input.disabled = true;
    document.getElementById('check-btn').disabled = true;
    showMessage(`Победа! Угадано за ${attempts} попыток.`, 'success');
  } else {
    showMessage(`${value} → ${result.bulls} бык(а), ${result.cows} коров(а)`, 'info');
  }
}

// 5. СОБЫТИЯ
document.getElementById('check-btn').addEventListener('click', handleGuess);
document.getElementById('new-btn').addEventListener('click', startNewGame);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleGuess(); });
input.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// Запуск при загрузке страницы
startNewGame();