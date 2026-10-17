// VIEW — отвечает только за отрисовку. Никакой логики игры здесь нет.

import { plural } from './model.js';

export class GameView {
  constructor() {
    this.input    = document.getElementById('guess-input');
    this.checkBtn = document.getElementById('check-btn');
    this.newBtn   = document.getElementById('new-btn');
    this.message  = document.getElementById('message');
    this.attempts = document.getElementById('attempts');
    this.history  = document.getElementById('history');
  }

  /** Отрисовать историю попыток. */
  renderHistory(items) {
    this.history.innerHTML = '';

    [...items].reverse().forEach(({ guess, bulls, cows }) => {
      const li = document.createElement('li');
      li.className = 'history__item';

      const left = document.createElement('span');
      left.className = 'history__guess';
      left.textContent = guess;

      const right = document.createElement('span');
      right.className = 'history__result';
      right.innerHTML =
        `<strong>${bulls}</strong> ${plural(bulls, 'бык', 'быка', 'быков')}, ` +
        `<strong>${cows}</strong> ${plural(cows, 'корова', 'коровы', 'коров')}`;

      li.append(left, right);
      this.history.append(li);
    });
  }

  /** Обновить счётчик попыток. */
  renderAttempts(count) {
    this.attempts.textContent = String(count);
  }

  /** Показать сообщение. */
  showMessage(text, type = '') {
    this.message.textContent = text;
    this.message.className = 'game__message' + (type ? ` game__message--${type}` : '');
  }

  /** Заблокировать/разблокировать ввод. */
  setDisabled(disabled) {
    this.input.disabled = disabled;
    this.checkBtn.disabled = disabled;
  }

  /** Очистить поле и поставить фокус. */
  clearInput() {
    this.input.value = '';
    this.input.focus();
  }

  /** Получить значение поля. */
  getInputValue() {
    return this.input.value;
  }

  /** Разрешить только цифры. */
  filterDigits(maxLength = 4) {
    this.input.value = this.input.value.replace(/\D/g, '').slice(0, maxLength);
  }

  /** Подписаться на события. */
  onCheck(callback)    { this.checkBtn.addEventListener('click', callback); }
  onNewGame(callback)  { this.newBtn.addEventListener('click', callback); }

  onEnter(callback) {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        callback();
      }
    });
  }

  onInput(callback) { this.input.addEventListener('input', callback); }
}