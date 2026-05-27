// Константи та стан додатку
const API_URL = 'https://jsonplaceholder.typicode.com';
let tasksState = [];

// DOM Елементи
const taskList = document.getElementById('task-list');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const userInfo = document.getElementById('user-info');

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

// Старт додатку
loadInitialData();