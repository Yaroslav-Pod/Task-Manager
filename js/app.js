// Константи та стан додатку
const API_URL = 'https://jsonplaceholder.typicode.com';
let tasksState = [];

// DOM Елементи
const taskList = document.getElementById('task-list');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const userInfo = document.getElementById('user-info');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');

// --- UX / Стан завантаження та помилок ---
function showLoader() { loader.classList.remove('hidden'); }
function hideLoader() { loader.classList.add('hidden'); }

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}
function clearError() {
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
}

// Блокування кнопки додавання, якщо інпут порожній
taskInput.addEventListener('input', () => {
    addBtn.disabled = !taskInput.value.trim();
});

// Обробка клавіші Escape в інпуті
taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        taskInput.value = '';
        addBtn.disabled = true;
    }
});

// --- Ініціалізація: Паралельне завантаження даних (Promise.all) ---
async function loadInitialData() {
    showLoader();
    clearError();
    try {
        const [todosResponse, userResponse] = await Promise.all([
            fetch(`${API_URL}/todos?_limit=20`),
            fetch(`${API_URL}/users/1`)
        ]);

        if (!todosResponse.ok || !userResponse.ok) {
            throw new Error('Помилка при отриманні даних з сервера.');
        }

        const [todos, user] = await Promise.all([
            todosResponse.json(),
            userResponse.json()
        ]);

        tasksState = todos;
        renderUserInfo(user);
        renderTasks();
    } catch (error) {
        showError('Не вдалося завантажити початкові дані. Спробуйте пізніше.');
        console.error('Помилка завантаження:', error);
    } finally {
        hideLoader();
    }
}

function renderUserInfo(user) {
    userInfo.textContent = `Користувач: ${user.name}`;
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.classList.add('task-item');
    li.dataset.id = task.id;

    if (task.completed) {
        li.classList.add('completed');
    }

    const taskLeft = document.createElement('div');
    taskLeft.classList.add('task-left');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.classList.add('task-checkbox');

    const span = document.createElement('span');
    span.textContent = task.title;
    span.classList.add('task-title');

    taskLeft.append(checkbox, span);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Видалити';
    deleteBtn.classList.add('task-delete');

    li.append(taskLeft, deleteBtn);
    return li;
}

function renderTasks() {
    taskList.innerHTML = '';
    tasksState.forEach(task => {
        taskList.append(createTaskElement(task));
    });
}

// --- CRUD Операції ---
// POST: Додавання завдання
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    showLoader();
    clearError();
    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ title, completed: false, userId: 1 })
        });

        if (!response.ok) throw new Error('Помилка сервера при створенні.');

        const newTask = await response.json();

        // Оскільки JSONPlaceholder повертає завжди id: 201, згенеруємо унікальний для DOM
        newTask.id = tasksState.length ? Math.max(...tasksState.map(t => t.id)) + 1 : 1;

        tasksState.unshift(newTask); // Додаємо на початок
        renderTasks();

        // Очищення форми
        taskForm.reset();
        addBtn.disabled = true;
    } catch (error) {
        showError('Не вдалося створити завдання.');
        console.error(error);
    } finally {
        hideLoader();
    }
});

// Старт додатку
loadInitialData();