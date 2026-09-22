const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const booksPath = path.join(__dirname, "data", "books.json");
const loadBooks = () => JSON.parse(fs.readFileSync(booksPath, "utf-8"));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/books", (req, res) => {
  const { search = "", genre = "All", language = "All" } = req.query;
  let books = loadBooks();
  const q = search.trim().toLowerCase();
  if (genre !== "All") books = books.filter(b => b.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
  if (language !== "All") books = books.filter(b => b.language.toLowerCase() === language.toLowerCase());
  if (q) books = books.filter(b => [b.title, b.author, b.description, b.language, ...b.genres, ...b.interests].join(" ").toLowerCase().includes(q));
  res.json(books);
});

app.get("/api/meta", (_req, res) => {
  const books = loadBooks();
  res.json({
    genres: [...new Set(books.flatMap(b => b.genres))].sort(),
    languages: [...new Set(books.map(b => b.language))].sort(),
    interests: [...new Set(books.flatMap(b => b.interests))].sort()
  });
});

app.get("/api/recommend", (req, res) => {
  const { languages = "", interests = "", excludeId, limit = 8 } = req.query;
  const selectedLanguages = languages.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const selectedInterests = interests.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const books = loadBooks();
  const ranked = books
    .filter(b => !excludeId || b.id !== Number(excludeId))
    .map(book => {
      const languageMatch = selectedLanguages.length && selectedLanguages.includes(book.language.toLowerCase()) ? 35 : 0;
      const interestHits = selectedInterests.filter(i => [...book.interests, ...book.genres].map(x => x.toLowerCase()).includes(i)).length;
      const interestScore = selectedInterests.length ? Math.min(45, (interestHits / selectedInterests.length) * 45) : 0;
      const ratingScore = (book.rating / 5) * 20;
      const score = Math.round(languageMatch + interestScore + ratingScore);
      const reasons = [];
      if (languageMatch) reasons.push(`${book.language} match`);
      if (interestHits) reasons.push(`${interestHits} interest match${interestHits > 1 ? "es" : ""}`);
      if (!reasons.length) reasons.push("Popular on the shelf");
      return { ...book, match: Math.min(99, score), reason: reasons.join(" · ") };
    })
    .sort((a, b) => b.match - a.match || b.rating - a.rating)
    .slice(0, Number(limit));
  res.json(ranked);
});

app.listen(PORT, () => console.log(`Book Recommender API running on http://localhost:${PORT}`));
