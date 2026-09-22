import { useEffect, useMemo, useState } from "react";
import SearchBar from "./components/SearchBar.jsx";
import BookCard from "./components/BookCard.jsx";
import { getBooks, getMeta, getRecommendations } from "./api.js";
import "./App.css";

const LANGUAGES = ["English", "Telugu", "Hindi", "Tamil", "Malayalam", "Kannada", "Bengali", "Marathi"];
const INTERESTS = ["Fantasy", "Romance", "Mystery", "Thriller", "Science", "History", "Self Help", "Personal Growth", "Adventure", "Psychology", "Family", "Indian Culture"];

export default function App() {
  const [step, setStep] = useState("discover");
  const [languages, setLanguages] = useState(["English"]);
  const [interests, setInterests] = useState(["Fantasy"]);
  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [search, setSearch] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("All");
  const [filterGenre, setFilterGenre] = useState("All");
  const [meta, setMeta] = useState({ genres: [], languages: [], interests: [] });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("inkleaf-saved") || "[]"));

  useEffect(() => { getMeta().then(setMeta).catch(() => {}); }, []);

  useEffect(() => {
    if (step !== "browse") return;
    setLoading(true);
    Promise.all([
      getBooks({ search, genre: filterGenre, language: filterLanguage }),
      getRecommendations({ languages, interests })
    ]).then(([all, recs]) => { setBooks(all); setRecommendations(recs); }).finally(() => setLoading(false));
  }, [step, search, filterGenre, filterLanguage, languages, interests]);

  const genres = useMemo(() => meta.genres.length ? meta.genres : [...new Set(books.flatMap(b => b.genres))], [meta.genres, books]);
  const toggle = (value, list, setter) => setter(list.includes(value) ? list.filter(x => x !== value) : [...list, value]);
  const saveBook = (book) => {
    const next = saved.some(b => b.id === book.id) ? saved.filter(b => b.id !== book.id) : [...saved, book];
    setSaved(next); localStorage.setItem("inkleaf-saved", JSON.stringify(next));
  };

  return <div className="app">
    <nav className="nav"><div className="brand"><span className="brand-mark">✦</span> inkleaf</div><div className="nav-links"><button onClick={() => setStep("discover")} className={step === "discover" ? "active" : ""}>Discover</button><button onClick={() => setStep("browse")} className={step === "browse" ? "active" : ""}>Explore books</button><button onClick={() => setStep("saved")} className={step === "saved" ? "active" : ""}>Saved <span>{saved.length}</span></button></div></nav>

    {step === "discover" && <section className="onboarding">
      <div className="eyebrow">YOUR PERSONAL BOOKSHELF</div>
      <h1>Find books that feel<br/><em>made for you.</em></h1>
      <p className="lead">Tell us what you love to read and which languages you enjoy. We'll build a shelf around your taste.</p>
      <div className="preference-card">
        <div className="pref-block"><div className="pref-label">01 · Languages</div><div className="chips">{LANGUAGES.map(l => <button key={l} onClick={() => toggle(l,languages,setLanguages)} className={`chip ${languages.includes(l)?"selected":""}`}>{l}</button>)}</div></div>
        <div className="pref-block"><div className="pref-label">02 · Interests</div><div className="chips">{INTERESTS.map(i => <button key={i} onClick={() => toggle(i,interests,setInterests)} className={`chip ${interests.includes(i)?"selected":""}`}>{i}</button>)}</div></div>
        <button className="primary" disabled={!languages.length || !interests.length} onClick={() => setStep("browse")}>Build my bookshelf <span>→</span></button>
      </div>
      <div className="trust-row"><span>✦ 24 curated books</span><span>◌ Multiple Indian languages</span><span>⌁ Recommendations explained</span></div>
    </section>}

    {step === "browse" && <main className="library">
      <section className="library-hero"><div><div className="eyebrow">PERSONALIZED FOR YOU</div><h2>Your next <em>great read</em></h2><p>Based on {languages.join(", ")} · {interests.slice(0,3).join(", ")}{interests.length>3?" + more":""}</p></div><button className="ghost" onClick={() => setStep("discover")}>Edit preferences</button></section>
      <section className="recommendations"><div className="section-heading"><div><h3>Picked for you</h3><p>Matched to your language and interests</p></div></div><div className="book-grid featured">{recommendations.map(b => <BookCard key={b.id} book={b} featured saved={saved.some(x=>x.id===b.id)} onSave={saveBook}/>)}</div></section>
      <section className="explore"><div className="section-heading"><div><h3>Explore the library</h3><p>Search and browse every title in the collection.</p></div></div><div className="filters"><SearchBar value={search} onChange={setSearch}/><select value={filterLanguage} onChange={e=>setFilterLanguage(e.target.value)}><option>All</option>{LANGUAGES.map(l=><option key={l}>{l}</option>)}</select><select value={filterGenre} onChange={e=>setFilterGenre(e.target.value)}><option>All</option>{genres.map(g=><option key={g}>{g}</option>)}</select></div>{loading?<div className="loading">Curating your shelf…</div>:<div className="book-grid">{books.map(b=><BookCard key={b.id} book={b} saved={saved.some(x=>x.id===b.id)} onSave={saveBook}/>)}</div>}</section>
    </main>}

    {step === "saved" && <main className="library saved-page"><section className="library-hero"><div><div className="eyebrow">YOUR READING LIST</div><h2>Books you want to <em>remember.</em></h2><p>Keep your next reads in one place.</p></div></section>{saved.length?<div className="book-grid">{saved.map(b=><BookCard key={b.id} book={b} saved onSave={saveBook}/>)}</div>:<div className="empty"><div>♡</div><h3>Your reading list is empty</h3><p>Tap the heart on any book to save it here.</p><button className="primary small" onClick={()=>setStep("browse")}>Explore books →</button></div>}</main>}
    <footer>inkleaf · discover your next story</footer>
  </div>;
}
