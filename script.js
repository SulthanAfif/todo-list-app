// ========== Dark Mode ==========
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
}

darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
        darkModeToggle.textContent = "☀️";
        localStorage.setItem("darkMode", "enabled");
    } else {
        darkModeToggle.textContent = "🌙";
        localStorage.setItem("darkMode", "disabled");
    }
});

// ========== To-Do List Logic ==========
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// Simpan ke localStorage
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Render daftar tugas
function renderTodos() {
    todoList.innerHTML = "";

    let filteredTodos = todos;
    if (currentFilter === "active") {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === "completed") {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li class="empty-message">Tidak ada tugas</li>`;
    } else {
        filteredTodos.forEach((todo, index) => {
            // Cari index asli di array todos
            const realIndex = todos.indexOf(todo);

            const li = document.createElement("li");
            li.className = `todo-item ${todo.completed ? "completed" : ""}`;

            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? "checked" : ""} data-index="${realIndex}">
                <span>${todo.text}</span>
                <button class="delete-btn" data-index="${realIndex}">×</button>
            `;

            todoList.appendChild(li);
        });
    }

    updateTaskCount();
}

// Update jumlah tugas tersisa
function updateTaskCount() {
    const remaining = todos.filter(todo => !todo.completed).length;
    taskCount.textContent = `${remaining} tugas tersisa`;
}

// Tambah tugas
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();

    if (text === "") return;

    todos.push({
        text: text,
        completed: false
    });

    saveTodos();
    renderTodos();
    todoInput.value = "";
    todoInput.focus();
});

// Centang / hapus tugas (event delegation)
todoList.addEventListener("click", (e) => {
    const index = e.target.dataset.index;

    if (e.target.type === "checkbox") {
        todos[index].completed = e.target.checked;
        saveTodos();
        renderTodos();
    }

    if (e.target.classList.contains("delete-btn")) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    }
});

// Filter
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Hapus semua yang selesai
clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
});

// Render pertama kali
renderTodos();