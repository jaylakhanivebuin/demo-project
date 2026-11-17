const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Demo data is stored in memory. It resets when the server restarts.
let tasks = [
  { id: 1, title: "Deploy this app on EC2", done: false },
  { id: 2, title: "Test the backend API", done: true }
];
let nextId = 3;

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Node.js backend is running", timestamp: new Date().toISOString() });
});

app.get("/api/tasks", (_req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  if (!title) return res.status(400).json({ error: "Task title is required" });

  const task = { id: nextId++, title, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.find(item => item.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (typeof req.body.done === "boolean") task.done = req.body.done;
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const oldLength = tasks.length;
  tasks = tasks.filter(item => item.id !== Number(req.params.id));
  if (tasks.length === oldLength) return res.status(404).json({ error: "Task not found" });
  res.status(204).end();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`App is running on http://0.0.0.0:${PORT}`);
});