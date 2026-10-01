// Express API for gurukul. In production it also serves the built client.
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
const STUDENT_ID = 1; // single demo student; replace with real auth/sessions later
const app = express();
app.use(express.json());

// Current student + a quick completed-lessons count for the header chip.
app.get("/api/me", (_req, res) => {
  const me = db.prepare("SELECT id, name FROM students WHERE id = ?").get(STUDENT_ID);
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM progress WHERE student_id = ?").get(STUDENT_ID);
  res.json({ ...me, completedLessons: n });
});

// Catalog: each course with sections as [name, [lesson titles]].
app.get("/api/courses", (_req, res) => {
  const courses = db.prepare("SELECT id, cat, level, title, hours, hue, lectures FROM courses ORDER BY sort").all();
  const lessons = db.prepare(
    "SELECT course_id, section_idx, section_name, title FROM lessons ORDER BY course_id, section_idx, position").all();
  const byId = new Map(courses.map((c) => [c.id, { ...c, sections: [] }]));
  for (const l of lessons) {
    const secs = byId.get(l.course_id).sections;
    (secs[l.section_idx] ??= [l.section_name, []])[1].push(l.title);
  }
  res.json([...byId.values()]);
});

// Completed lesson ids for the student.
app.get("/api/progress", (_req, res) => {
  const rows = db.prepare("SELECT lesson_id FROM progress WHERE student_id = ?").all(STUDENT_ID);
  res.json(rows.map((r) => r.lesson_id));
});

// Mark a lesson complete / incomplete. Body: { completed: boolean }
app.put("/api/progress/:lessonId", (req, res) => {
  const { lessonId } = req.params;
  if (typeof req.body?.completed !== "boolean") return res.status(400).json({ error: "completed must be boolean" });
  if (!db.prepare("SELECT 1 FROM lessons WHERE id = ?").get(lessonId)) return res.status(404).json({ error: "lesson not found" });
  if (req.body.completed) {
    db.prepare("INSERT OR IGNORE INTO progress (student_id, lesson_id) VALUES (?, ?)").run(STUDENT_ID, lessonId);
  } else {
    db.prepare("DELETE FROM progress WHERE student_id = ? AND lesson_id = ?").run(STUDENT_ID, lessonId);
  }
  res.json({ lessonId, completed: req.body.completed });
});

app.use("/api", (_req, res) => res.status(404).json({ error: "not found" }));

// Serve the built React app (npm run build) when present.
const dist = path.join(dir, "../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((_req, res) => res.sendFile(path.join(dist, "index.html")));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`gurukul API on http://localhost:${PORT}`));
