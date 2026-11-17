const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const errorMessage = document.getElementById("errorMessage");
const serverStatus = document.getElementById("serverStatus");

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

async function checkHealth() {
  try {
    const health = await api("/api/health");
    serverStatus.textContent = `Backend online • ${new Date(health.timestamp).toLocaleTimeString()}`;
    serverStatus.classList.add("online");
  } catch {
    serverStatus.textContent = "Backend unavailable";
    serverStatus.classList.remove("online");
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  taskCount.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;
  emptyState.hidden = tasks.length > 0;

  for (const task of tasks) {
    const item = document.createElement("li");
    if (task.done) item.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.title} complete`);
    checkbox.addEventListener("change", async () => {
      try {
        await api(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify({ done: checkbox.checked })
        });
        await loadTasks();
      } catch (error) { showError(error.message); }
    });

    const title = document.createElement("span");
    title.textContent = task.title;

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "delete";
    remove.addEventListener("click", async () => {
      try {
        await api(`/api/tasks/${task.id}`, { method: "DELETE" });
        await loadTasks();
      } catch (error) { showError(error.message); }
    });

    item.append(checkbox, title, remove);
    taskList.append(item);
  }
}

function showError(message = "") { errorMessage.textContent = message; }

async function loadTasks() {
  try {
    const tasks = await api("/api/tasks");
    renderTasks(tasks);
    showError();
  } catch (error) { showError(error.message); }
}

taskForm.addEventListener("submit", async event => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  try {
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title })
    });
    taskInput.value = "";
    await loadTasks();
  } catch (error) { showError(error.message); }
});

checkHealth();
loadTasks();
setInterval(checkHealth, 15000);
