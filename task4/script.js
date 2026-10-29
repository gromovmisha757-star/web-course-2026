// --- Состояние приложения ---
let tasks = [];               // { id, text, completed }
let currentFilter = 'all';    // 'all' | 'active' | 'completed'
let nextId = 1;

// --- DOM ---
const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const listEl = document.getElementById('task-list');
const statsEl = document.getElementById('stats');
const filtersEl = document.getElementById('filters');
const emptyEl = document.getElementById('empty');

// --- Рендер ---
function render() {
  // Фильтрация массива через filter()
  const visible = tasks.filter(t => {
    if (currentFilter === 'active') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  // Рендер через map()
  listEl.innerHTML = '';
  visible.map(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    const delBtn = document.createElement('button');
    delBtn.className = 'task-delete';
    delBtn.textContent = 'Удалить';

    li.append(checkbox, span, delBtn);
    listEl.append(li);
  });

  // Счётчики
  const completed = tasks.filter(t => t.completed).length;
  statsEl.textContent = `Осталось: ${tasks.length - completed}, Выполнено: ${completed}`;

  // Сообщение о пустоте
  emptyEl.hidden = visible.length > 0;
}

// --- Добавление задачи ---
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return; // пустые задачи не добавляем

  tasks.push({ id: nextId++, text, completed: false });
  input.value = '';
  render();
});

// --- Обработка кликов по списку (делегирование) ---
listEl.addEventListener('click', e => {
  const li = e.target.closest('.task-item');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.classList.contains('task-delete')) {
    tasks = tasks.filter(t => t.id !== id);
    render();
  } else if (e.target.type === 'checkbox') {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    render();
  }
});

// --- Переключение фильтров ---
filtersEl.addEventListener('click', e => {
  const btn = e.target.closest('.filter');
  if (!btn) return;

  currentFilter = btn.dataset.filter;

  // Подсветка активной кнопки
  filtersEl.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  render();
});

// --- Первичный рендер ---
render();