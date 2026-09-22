export default function GenreFilter({ genres, active, onSelect }) {
  const all = ["All", ...genres];
  return (
    <div className="genre-filter" role="tablist" aria-label="Filter by genre">
      {all.map((g) => (
        <button
          key={g}
          role="tab"
          aria-selected={active === g}
          className={`genre-chip ${active === g ? "is-active" : ""}`}
          onClick={() => onSelect(g)}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
