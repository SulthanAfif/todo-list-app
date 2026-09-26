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
const sortSelect = document.getElementById("sortSelect");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";
let currentSort = "default";

const priorityLabel = {
    high: "Tinggi",
    medium: "Sedang",
    low: "Rendah"
};

const priorityOrder = { high: 1, medium: 2, low: 3 };

function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", options);
}

function isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dateStr + "T00:00:00");
    return taskDate < today;
}

function getSortedTodos(list) {
    const sorted = [...list];

    if (currentSort === "priority") {
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (currentSort === "date") {
        sorted.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });
    }
    return sorted;
}

function renderTodos() {
    todoList.innerHTML = "";

    let filtered = todos;

    if (currentFilter === "active") {
        filtered = todos.filter(t => !t.completed);
    } else if (currentFilter === "completed") {
        filtered = todos.filter(t => t.completed);
    }

    filtered = getSortedTodos(filtered);

    if (filtered.length === 0) {
        todoList.innerHTML = `
            <li class="empty-message">
                <div class="icon">📝</div>
                <p>Belum ada tugas.<br>Yuk tambah yang baru!</p>
            </li>
        `;
        updateTaskCount();
        return;
    }

    filtered.forEach(todo => {
        const index = todos.indexOf(todo);
        const overdue = !todo.completed && isOverdue(todo.date);

        const li = document.createElement("li");
        li.className = `todo-item ${todo.completed ? "completed" : ""} ${overdue ? "overdue" : ""}`;
        li.dataset.index = index;

        const dateHtml = todo.date
            ? `<span class="todo-date ${overdue ? "overdue-text" : ""}">
                    📅 ${formatDate(todo.date)}${overdue ? " · Terlewat" : ""}
               </span>`
            : "";

        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? "checked" : ""} data-index="${index}">
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
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

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function updateTaskCount() {
    const remaining = todos.filter(t => !t.completed).length;
    taskCount.textContent = remaining === 0 
        ? "Semua selesai! 🎉" 
        : `${remaining} tugas tersisa`;
}

// Tambah tugas
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = todoInput.value.trim();
    if (!text) return;

    todos.unshift({
        text: text,
        completed: false,
        priority: prioritySelect.value,
        date: dateInput.value || null,
        createdAt: Date.now()
    });

    saveTodos();
    renderTodos();

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
        const confirmed = confirm(`Hapus tugas "${todos[index].text}"?`);
        if (confirmed) {
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        }
        return;
    }

    if (e.target.classList.contains("edit-btn")) {
        startEdit(Number(index));
    }
});

// Double click edit
todoList.addEventListener("dblclick", (e) => {
    if (e.target.classList.contains("todo-text")) {
        const li = e.target.closest(".todo-item");
        startEdit(Number(li.dataset.index));
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
            <input type="text" class="edit-input" value="${escapeHtml(todo.text)}">
            <div class="edit-controls">
                <select class="edit-priority">
                    <option value="low" ${todo.priority === "low" ? "selected" : ""}>Rendah</option>
                    <option value="medium" ${todo.priority === "medium" ? "selected" : ""}>Sedang</option>
                    <option value="high" ${todo.priority === "high" ? "selected" : ""}>Tinggi</option>
                </select>
                <input type="date" class="edit-date" value="${todo.date || ""}">
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
        if (e.key === "Enter") {
            e.preventDefault();
            saveEdit();
        }
        if (e.key === "Escape") {
            renderTodos();
        }
    });

    // Klik di luar untuk simpan
    const handleClickOutside = (e) => {
        if (!li.contains(e.target)) {
            saveEdit();
            document.removeEventListener("click", handleClickOutside);
        }
    };
    setTimeout(() => document.addEventListener("click", handleClickOutside), 10);
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

// Sort
sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    renderTodos();
});

// Hapus yang selesai
clearCompletedBtn.addEventListener("click", () => {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;

    const confirmed = confirm(`Hapus ${completedCount} tugas yang sudah selesai?`);
    if (confirmed) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
    }
});

// Render awal
renderTodos();