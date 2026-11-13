// ТОЧКА ВХОДА — создаёт Model, View и Controller, запускает игру.

import { GameModel } from './model.js';
import { GameView } from './view.js';
import { GameController } from './controller.js';

// Ждём полной загрузки DOM, чтобы View нашёл все элементы по id.
document.addEventListener('DOMContentLoaded', () => {
  const model = new GameModel();
  const view = new GameView();
  const controller = new GameController(model, view);

  // Стартуем первую игру автоматически.
  controller.start();
});