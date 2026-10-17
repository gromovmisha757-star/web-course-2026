// MODEL — хранит состояние игры и всю игровую логику.
// Никакого DOM здесь нет.

export const CODE_LENGTH = 4;

export class GameModel {
  constructor() {
    this.reset();
  }

  /** Начать новую игру. */
  reset() {
    this.secret   = this._generateSecret();
    this.history  = [];   // [{ guess, bulls, cows }]
    this.attempts = 0;
    this.finished = false;
  }

  /** Сделать ход. Возвращает результат или ошибку. */
  makeGuess(rawInput) {
    if (this.finished) {
      return { ok: false, error: 'Игра завершена' };
    }

    const validation = this._validateInput(rawInput);
    if (!validation.ok) return validation;

    const guess = validation.value;
    const { bulls, cows } = this._countBullsAndCows(this.secret, guess);

    this.history.push({ guess, bulls, cows });
    this.attempts += 1;

    if (bulls === CODE_LENGTH) {
      this.finished = true;
    }

    return { ok: true, guess, bulls, cows, finished: this.finished };
  }

  // ---------- Приватные методы ----------

  /** Случайные 4 неповторяющиеся цифры. */
  _generateSecret() {
    const digits = ['0','1','2','3','4','5','6','7','8','9'];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    return digits.slice(0, CODE_LENGTH).join('');
  }

  /** Проверка ввода игрока. */
  _validateInput(raw) {
    const value = String(raw ?? '').trim();

    if (value === '')                  return { ok: false, error: 'Введите 4 цифры' };
    if (!/^\d+$/.test(value))          return { ok: false, error: 'Разрешены только цифры' };
    if (value.length !== CODE_LENGTH)  return { ok: false, error: `Нужно ровно ${CODE_LENGTH} цифры` };
    if (new Set(value).size !== CODE_LENGTH)
      return { ok: false, error: 'Цифры не должны повторяться' };

    return { ok: true, value };
  }

  /** Подсчёт быков и коров. */
  _countBullsAndCows(secret, guess) {
    let bulls = 0;
    let cows  = 0;

    for (let i = 0; i < secret.length; i++) {
      if (guess[i] === secret[i])          bulls++;
      else if (secret.includes(guess[i]))  cows++;
    }
    return { bulls, cows };
  }
}

// ---------- Утилиты для склонений (тоже логика) ----------

export function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function describeResult({ bulls, cows }) {
  const b = plural(bulls, 'бык', 'быка', 'быков');
  const c = plural(cows,  'корова', 'коровы', 'коров');
  return `${bulls} ${b}, ${cows} ${c}`;
}

export function attemptsWord(n) {
  return plural(n, 'попытку', 'попытки', 'попыток');
}