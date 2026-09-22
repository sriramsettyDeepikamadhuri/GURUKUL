const COLORS = ["plum","teal","rust","gold","blue"];
export default function BookCard({book,onSave,saved,featured}) {
  const color = COLORS[(book.id||0)%COLORS.length];
  return <article className={`book-card ${featured?"featured-card":""}`}>
    <div className={`cover ${color}`}><div className="cover-top">{book.language}</div><div className="cover-title">{book.title}</div><div className="cover-author">{book.author}</div><div className="cover-symbol">✦</div></div>
    <div className="book-info"><div className="book-meta"><span>{book.genres[0]}</span><span>★ {book.rating.toFixed(1)}</span></div><h4>{book.title}</h4><p className="author">{book.author} · {book.year}</p><p className="desc">{book.description}</p><div className="tags">{book.interests.slice(0,2).map(x=><span key={x}>{x}</span>)}</div>{book.match && <div className="match"><b>{book.match}% match</b><span>{book.reason}</span></div>}<div className="card-bottom"><span>{book.pages} pages</span><button className={`save ${saved?"saved":""}`} onClick={()=>onSave(book)} aria-label={saved?"Remove from saved":"Save book"}>{saved?"♥":"♡"}</button></div></div>
  </article>
}
