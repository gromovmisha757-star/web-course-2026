// CONTROLLER — связывает Model и View, обрабатывает события.

import { GameModel, describeResult, attemptsWord } from './model.js';
import { GameView } from './view.js';

export class GameController {
  constructor(model, view) {
    this.model = model;
    this.view  = view;
    this._bindEvents();
  }

  /** Запустить новую игру. */
  start() {
    this.model.reset();

    this.view.renderHistory(this.model.history);
    this.view.renderAttempts(this.model.attempts);
    this.view.showMessage('Новая игра! Введите 4 цифры.', 'info');
    this.view.setDisabled(false);
    this.view.clearInput();

    // для отладки:
    console.log('Загадано:', this.model.secret);
  }

  /** Обработать ход игрока. */
  handleCheck() {
    const result = this.model.makeGuess(this.view.getInputValue());

    if (!result.ok) {
      this.view.showMessage(result.error, 'error');
      return;
    }

    this.view.renderHistory(this.model.history);
    this.view.renderAttempts(this.model.attempts);

    if (result.finished) {
      this.view.showMessage(
        `Победа! Угадано за ${this.model.attempts} ${attemptsWord(this.model.attempts)}.`,
        'success'
      );
      this.view.setDisabled(true);
    } else {
      this.view.showMessage(
        `${result.guess} → ${describeResult(result)}`,
        'info'
      );
      this.view.clearInput();
    }
  }

  // ---------- Слушатели ----------

  _bindEvents() {
    this.view.onCheck(() => this.handleCheck());
    this.view.onNewGame(() => this.start());
    this.view.onEnter(() => this.handleCheck());
    this.view.onInput(() => this.view.filterDigits(4));
  }
}