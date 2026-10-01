// SQLite setup: schema + first-run seed from courses.js.
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import COURSES, { SEED_PROGRESS } from "./courses.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(process.env.DB_FILE || path.join(dir, "gurukul.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY, sort INTEGER, cat TEXT, level TEXT, title TEXT,
  hours REAL, hue INTEGER, lectures INTEGER);
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,                       -- "courseId:sectionIdx:lessonIdx"
  course_id TEXT NOT NULL REFERENCES courses(id),
  section_idx INTEGER, section_name TEXT, position INTEGER, title TEXT);
CREATE TABLE IF NOT EXISTS progress (
  student_id INTEGER NOT NULL REFERENCES students(id),
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, lesson_id));
`);

if (!db.prepare("SELECT 1 FROM courses LIMIT 1").get()) {
  const seed = db.transaction(() => {
    db.prepare("INSERT INTO students (id, name) VALUES (1, 'Ananya K.')").run();
    const addCourse = db.prepare("INSERT INTO courses VALUES (?,?,?,?,?,?,?,?)");
    const addLesson = db.prepare("INSERT INTO lessons VALUES (?,?,?,?,?,?)");
    COURSES.forEach((c, i) => {
      const lectures = c.sections.reduce((n, s) => n + s[1].length, 0);
      addCourse.run(c.id, i, c.cat, c.level, c.title, c.hours, c.hue, lectures);
      c.sections.forEach(([name, titles], si) =>
        titles.forEach((t, li) => addLesson.run(`${c.id}:${si}:${li}`, c.id, si, name, li, t)));
    });
    const addDone = db.prepare("INSERT INTO progress (student_id, lesson_id) VALUES (1, ?)");
    SEED_PROGRESS.forEach((id) => addDone.run(id));
  });
  seed();
}

export default db;
