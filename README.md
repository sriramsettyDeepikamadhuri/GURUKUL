# Inkleaf — Book Recommendation Website

A full-stack book recommendation app.

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express (REST API, JSON dataset — no database needed)

```
book-recommender/
├── backend/          Express API (serves book data + recommendations)
│   ├── data/books.json
│   ├── server.js
│   └── package.json
└── frontend/         React app (Vite)
    ├── src/
    └── package.json
```

---

## 1. Run it on your machine

You need **Node.js 18+** installed (check with `node -v`). Get it from
https://nodejs.org if you don't have it.

### Start the backend (Terminal 1)

```bash
cd book-recommender/backend
npm install
npm start
```

This runs the API at `http://localhost:5000`. Test it: open
`http://localhost:5000/api/books` in a browser — you should see JSON.

### Start the frontend (Terminal 2, leave the backend running)

```bash
cd book-recommender/frontend
npm install
npm run dev
```

Vite will print a local URL, normally `http://localhost:5173`. Open it —
that's your book recommendation site. The dev server automatically proxies
`/api/*` calls to the backend on port 5000, so both must be running.

---

## 2. Push it to Git / GitHub

From the `book-recommender` folder (the project root, containing both
`backend` and `frontend`):

```bash
cd book-recommender
git init
git add .
git commit -m "Initial commit: book recommendation app"
```

Then create an empty repository on GitHub (github.com → **New repository**,
don't initialize it with a README), and connect it:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

`node_modules` and build folders are already excluded via `.gitignore`, so
only your source code gets pushed.

---

## 3. Download it to another device

On the new device (with Node.js installed), clone the repo:

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

Then repeat the two `npm install` + start steps from **Section 1** in
`backend/` and `frontend/`. Cloning does not bring `node_modules` (it's
git-ignored), so `npm install` re-downloads dependencies fresh each time —
that's expected and normal.

---

## 4. Deploy it live

The simplest free-tier combo is **Vercel for the frontend** and
**Render for the backend**. Any Node host works the same way in principle.

### Deploy the backend (Render)

1. Push your code to GitHub (Section 2).
2. Go to https://render.com → **New → Web Service** → connect your repo.
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Deploy. Render gives you a live URL like `https://your-app.onrender.com`.

### Deploy the frontend (Vercel)

1. Go to https://vercel.com → **Add New → Project** → import the same repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Vite
   (build command `npm run build`, output directory `dist`).
3. Add an environment variable so the deployed frontend calls your live
   backend instead of `localhost` (the code already supports this via
   `frontend/src/api.js`):
   - In Vercel's project settings → **Environment Variables**, add
     `VITE_API_URL` = `https://your-app.onrender.com/api`.
4. Also enable CORS for your deployed frontend's domain in
   `backend/server.js` if you want to restrict it (currently it allows all
   origins via `app.use(cors())`, which is fine to start with).
5. Deploy. Vercel gives you a live URL for the site.

### One-server alternative

If you'd rather deploy a single service instead of two, you can have
Express serve the built React files directly:

```bash
cd frontend && npm run build
```

Then copy `frontend/dist` into the backend and add to `server.js`:

```js
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
```

Deploy just the `backend` folder (with `dist` inside it) to Render,
Railway, or any Node host — one URL serves both the site and the API.

---

## API reference

| Method | Route                              | Description                          |
|--------|-------------------------------------|---------------------------------------|
| GET    | `/api/books?search=&genre=`         | List books, optional search/filter    |
| GET    | `/api/books/:id`                    | Get one book                          |
| GET    | `/api/genres`                       | List distinct genres                  |
| GET    | `/api/recommend?genre=&excludeId=`  | Top-rated picks in a genre            |

## Customizing the data

Edit `backend/data/books.json` to add, remove, or change books — no
database or migration needed, just valid JSON.
# BookRecommendation
