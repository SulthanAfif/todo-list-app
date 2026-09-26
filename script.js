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

// ========== To-Do List ==========
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const prioritySelect = document.getElementById("prioritySelect");
const dateInput = document.getElementById("dateInput");
const todoList = document.getElementById("todoList");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// Label prioritas
const priorityLabel = {
    high: "Tinggi",
    medium: "Sedang",
    low: "Rendah"
};

function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
}

function renderTodos() {
    todoList.innerHTML = "";

    let filtered = todos;
    if (currentFilter === "active") {
        filtered = todos.filter(t => !t.completed);
    } else if (currentFilter === "completed") {
        filtered = todos.filter(t => t.completed);
    }

    if (filtered.length === 0) {
        todoList.innerHTML = `<li class="empty-message">Tidak ada tugas</li>`;
        updateTaskCount();
        return;
    }

    filtered.forEach(todo => {
        const index = todos.indexOf(todo);

        const li = document.createElement("li");
        li.className = `todo-item ${todo.completed ? "completed" : ""}`;
        li.dataset.index = index;

        const dateHtml = todo.date 
            ? `<span class="todo-date">📅 ${formatDate(todo.date)}</span>` 
            : "";

        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? "checked" : ""} data-index="${index}">
            <div class="todo-content">
                <span class="todo-text">${todo.text}</span>
                <div class="todo-meta">
                    <span class="priority-badge ${todo.priority}">${priorityLabel[todo.priority]}</span>
                    ${dateHtml}
                </div>
            </div>
            <div class="actions">
                <button class="edit-btn" data-index="${index}" title="Edit">✎</button>
                <button class="delete-btn" data-index="${index}" title="Hapus">×</button>
            </div>
        `;

        todoList.appendChild(li);
    });

    updateTaskCount();
}

function updateTaskCount() {
    const remaining = todos.filter(t => !t.completed).length;
    taskCount.textContent = `${remaining} tugas tersisa`;
}

// Tambah tugas
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = todoInput.value.trim();
    if (!text) return;

    todos.push({
        text: text,
        completed: false,
        priority: prioritySelect.value,
        date: dateInput.value || null
    });

    saveTodos();
    renderTodos();

    // Reset form
    todoInput.value = "";
    prioritySelect.value = "medium";
    dateInput.value = "";
    todoInput.focus();
});

// Event delegation
todoList.addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.type === "checkbox") {
        todos[index].completed = e.target.checked;
        saveTodos();
        renderTodos();
        return;
    }

    if (e.target.classList.contains("delete-btn")) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
        return;
    }

    if (e.target.classList.contains("edit-btn")) {
        startEdit(index);
    }
});

// Double click untuk edit
todoList.addEventListener("dblclick", (e) => {
    if (e.target.classList.contains("todo-text")) {
        const li = e.target.closest(".todo-item");
        startEdit(li.dataset.index);
    }
});

function startEdit(index) {
    const li = document.querySelector(`.todo-item[data-index="${index}"]`);
    if (!li || li.classList.contains("editing")) return;

    const todo = todos[index];
    li.classList.add("editing");

    li.innerHTML = `
        <input type="checkbox" ${todo.completed ? "checked" : ""} disabled>
        <div class="todo-content">
            <input type="text" class="edit-input" value="${todo.text}">
            <div class="todo-meta" style="margin-top: 0.5rem;">
                <select class="edit-priority" style="padding: 0.3rem; border-radius: 6px; border: 1px solid var(--border);">
                    <option value="low" ${todo.priority === "low" ? "selected" : ""}>Rendah</option>
                    <option value="medium" ${todo.priority === "medium" ? "selected" : ""}>Sedang</option>
                    <option value="high" ${todo.priority === "high" ? "selected" : ""}>Tinggi</option>
                </select>
                <input type="date" class="edit-date" value="${todo.date || ""}" style="padding: 0.3rem; border-radius: 6px; border: 1px solid var(--border);">
            </div>
        </div>
        <div class="actions">
            <button class="delete-btn" data-index="${index}">×</button>
        </div>
    `;

    const editInput = li.querySelector(".edit-input");
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    const saveEdit = () => {
        const newText = editInput.value.trim();
        const newPriority = li.querySelector(".edit-priority").value;
        const newDate = li.querySelector(".edit-date").value || null;

        if (newText === "") {
            todos.splice(index, 1);
        } else {
            todos[index].text = newText;
            todos[index].priority = newPriority;
            todos[index].date = newDate;
        }
        saveTodos();
        renderTodos();
    };

    editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit();
        if (e.key === "Escape") renderTodos();
    });

    // Simpan saat klik di luar
    setTimeout(() => {
        document.addEventListener("click", function handler(e) {
            if (!li.contains(e.target)) {
                saveEdit();
                document.removeEventListener("click", handler);
            }
        });
    }, 0);
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

// Hapus yang selesai
clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
});

// Render awal
renderTodos();