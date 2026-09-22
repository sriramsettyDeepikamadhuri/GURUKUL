export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="Search by title, author, or theme..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search books"
      />
    </div>
  );
}
