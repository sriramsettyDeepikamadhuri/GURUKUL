# gurukul

Full-stack learning platform.

- **client/** React 18 + Vite + Tailwind CSS
- **server/** Node + Express + SQLite (better-sqlite3)

## Run (Node 18+)
```
npm run setup     # installs root, server and client dependencies
npm run dev       # API on :4000, web app on http://localhost:5173
```

## Production
```
npm run build     # builds client/dist
npm start         # Express serves the API and the built client on :4000
```

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/me | current student + completed lesson count |
| GET | /api/courses | catalog with sections and lesson titles |
| GET | /api/progress | completed lesson ids |
| PUT | /api/progress/:lessonId | body `{ "completed": true\|false }` |

The SQLite file (`server/gurukul.db`) is created and seeded on first run from `server/courses.js`.
Auth is a single demo student (id 1) for now.
