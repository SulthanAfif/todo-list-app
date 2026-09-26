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
        filteredTodos.forEach((todo) => {
            const realIndex = todos.indexOf(todo);

            const li = document.createElement("li");
            li.className = `todo-item ${todo.completed ? "completed" : ""}`;
            li.dataset.index = realIndex;

            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? "checked" : ""} data-index="${realIndex}">
                <span class="todo-text">${todo.text}</span>
                <div class="actions">
                    <button class="edit-btn" data-index="${realIndex}" title="Edit">✎</button>
                    <button class="delete-btn" data-index="${realIndex}" title="Hapus">×</button>
                </div>
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

// Event delegation untuk checkbox, edit, dan hapus
todoList.addEventListener("click", (e) => {
    const index = e.target.dataset.index;

    // Centang selesai
    if (e.target.type === "checkbox") {
        todos[index].completed = e.target.checked;
        saveTodos();
        renderTodos();
        return;
    }

    // Hapus
    if (e.target.classList.contains("delete-btn")) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
        return;
    }

    // Mulai edit (tombol edit)
    if (e.target.classList.contains("edit-btn")) {
        startEdit(index);
        return;
    }
});

// Double-click pada teks untuk edit
todoList.addEventListener("dblclick", (e) => {
    if (e.target.classList.contains("todo-text")) {
        const li = e.target.closest(".todo-item");
        const index = li.dataset.index;
        startEdit(index);
    }
});

// Fungsi mulai edit
function startEdit(index) {
    const li = document.querySelector(`.todo-item[data-index="${index}"]`);
    if (!li || li.classList.contains("editing")) return;

    const currentText = todos[index].text;
    li.classList.add("editing");

    li.innerHTML = `
        <input type="checkbox" ${todos[index].completed ? "checked" : ""} disabled>
        <input type="text" class="edit-input" value="${currentText}">
        <div class="actions">
            <button class="delete-btn" data-index="${index}">×</button>
        </div>
    `;

    const editInput = li.querySelector(".edit-input");
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    // Simpan saat tekan Enter
    editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            finishEdit(index, editInput.value);
        }
        if (e.key === "Escape") {
            renderTodos(); // batal
        }
    });

    // Simpan saat klik di luar
    editInput.addEventListener("blur", () => {
        finishEdit(index, editInput.value);
    });
}

// Fungsi selesai edit
function finishEdit(index, newText) {
    newText = newText.trim();
    if (newText === "") {
        // Kalau kosong, hapus saja
        todos.splice(index, 1);
    } else {
        todos[index].text = newText;
    }
    saveTodos();
    renderTodos();
}

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