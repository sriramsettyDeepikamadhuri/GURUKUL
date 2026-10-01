import React, { useState, useMemo, useEffect } from "react";

/* Thin fetch wrapper for the Express API (proxied to :4000 in dev). */
const api = (path, opt = {}) =>
  fetch("/api" + path, { headers: { "Content-Type": "application/json" }, ...opt })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });

/* ================= DATA ================= */
// Course data is served by GET /api/courses (seeded from server/courses.js).
const CATEGORIES = ["Tech & Systems Architecture", "Creative Layout Arts", "Management Dynamics"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

// Lessons have stable ids "courseId:sectionIndex:lessonIndex", shared with the API.
const key = (cid,s,l) => `${cid}:${s}:${l}`;

// Tiny markdown renderer: #/## headings, - bullets, ``` code, **bold**, `inline`.
function md(src){
  const inl = t => t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/`(.+?)`/g,"<code>$1</code>");
  let html="", list=false, code=false;
  for(const line of src.split("\n")){
    if(line.startsWith("```")){ html+= code?"</pre>":"<pre>"; code=!code; continue; }
    if(code){ html+=line.replace(/</g,"&lt;")+"\n"; continue; }
    if(line.startsWith("- ")){ if(!list){html+="<ul>";list=true;} html+=`<li>${inl(line.slice(2))}</li>`; continue; }
    if(list){html+="</ul>";list=false;}
    if(line.startsWith("## ")) html+=`<h2>${inl(line.slice(3))}</h2>`;
    else if(line.startsWith("# ")) html+=`<h1>${inl(line.slice(2))}</h1>`;
    else if(line.trim()) html+=`<p>${inl(line)}</p>`;
  }
  return html+(list?"</ul>":"");
}
const notesFor = (course,title) =>
`# ${title}
Part of **${course.title}**. Read these notes, watch the lecture, then mark the lesson complete.

## Key ideas
- Start from the problem, not the tool
- Keep each decision small and reversible
- Write down what you would check next time

## Try it
\`\`\`
1. Pause the video at the demo
2. Reproduce it from scratch
3. Change one thing and note the result
\`\`\`
Use \`Mark complete\` below the player when you are done.`;

/* ================= HELPERS ================= */
const Icon = ({d,className="w-5 h-5"}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}/></svg>
);
const I = { search:"M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3", check:"M20 6L9 17l-5-5", chev:"M6 9l6 6 6-6", play:"M6 4l14 8-14 8z", menu:"M3 6h18M3 12h18M3 18h18" };

// Vector thumbnail: hue-driven gradient with category-specific shapes.
function Thumb({course,className=""}){
  const h=course.hue, a=`hsl(${h} 70% 38%)`, b=`hsl(${h+40} 75% 62%)`, id="g"+course.id;
  return (
    <svg className={className} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${course.title} thumbnail`}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a}/><stop offset="1" stopColor={b}/></linearGradient></defs>
      <rect width="160" height="100" fill={`url(#${id})`}/>
      {course.cat===CATEGORIES[0] && <g fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="3"><rect x="40" y="28" width="30" height="20" rx="3"/><rect x="92" y="28" width="30" height="20" rx="3"/><rect x="66" y="62" width="30" height="20" rx="3"/><path d="M55 48v8h26v6M107 48v8H81"/></g>}
      {course.cat===CATEGORIES[1] && <g fill="#fff" fillOpacity=".85"><text x="30" y="72" fontSize="54" fontWeight="800" fontFamily="serif">Aa</text><rect x="104" y="30" width="30" height="5"/><rect x="104" y="42" width="22" height="5"/><rect x="104" y="54" width="30" height="5"/></g>}
      {course.cat===CATEGORIES[2] && <g fill="#fff" fillOpacity=".85"><circle cx="80" cy="34" r="12"/><circle cx="46" cy="64" r="10"/><circle cx="114" cy="64" r="10"/><path d="M80 46L46 54M80 46l34 8" stroke="#fff" strokeWidth="3"/></g>}
    </svg>
  );
}
const Bar = ({pct}) => (
  <div className="flex items-center gap-2" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label="Course progress">
    <div className="h-1.5 flex-1 rounded-full" style={{background:"var(--bd)"}}><div className="h-full rounded-full transition-all" style={{width:pct+"%",background:"var(--pri)"}}/></div>
    <span className="text-xs mut w-8 text-right">{pct}%</span>
  </div>
);

/* ================= HEADER ================= */
function Header({view,setView,query,setQuery,done}){
  const [open,setOpen] = useState(false);
  const links=[["dashboard","Dashboard"],["browse","Browse Courses"],["library","My Library"]];
  const go = v => { setView(v); setOpen(false); };
  return (
    <header className="sticky top-0 z-30 bdb" style={{background:"var(--bg)",top:"env(safe-area-inset-top,0px)"}}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
        <button className="md:hidden p-2 -ml-2" aria-label="Toggle menu" aria-expanded={open} onClick={()=>setOpen(!open)}><Icon d={I.menu}/></button>
        <a href="#" onClick={e=>{e.preventDefault();go("dashboard")}} className="text-2xl font-extrabold tracking-tight" style={{color:"var(--pri)"}}>gurukul</a>
        <nav className="hidden md:flex gap-1 ml-4" aria-label="Primary">
          {links.map(([v,l])=><button key={v} className="navl" aria-current={view===v?"page":undefined} onClick={()=>go(v)}>{l}</button>)}
        </nav>
        <div className="flex-1"/>
        <label className="relative hidden sm:block">
          <span className="sr-only">Search courses</span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 mut"><Icon d={I.search} className="w-4 h-4"/></span>
          <input value={query} onChange={e=>{setQuery(e.target.value); if(view!=="browse") setView("browse");}} placeholder="Search courses"
            className="bd rounded-lg pl-9 pr-3 h-10 w-56 lg:w-72 text-sm bg-transparent"/>
        </label>
        <button className="flex items-center gap-2 ghost !px-2" aria-label="Student profile">
          <span className="w-7 h-7 rounded-full grid place-items-center text-xs font-bold" style={{background:"var(--pri)",color:"var(--pri-fg)"}}>AK</span>
          <span className="hidden lg:block text-left leading-tight"><span className="block text-sm font-semibold">Ananya K.</span><span className="block text-xs mut">{done} lessons done</span></span>
        </button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-1 bdb-0">
          <input value={query} onChange={e=>{setQuery(e.target.value); setView("browse");}} placeholder="Search courses" aria-label="Search courses" className="bd rounded-lg px-3 h-11 text-sm bg-transparent sm:hidden mb-1"/>
          {links.map(([v,l])=><button key={v} className="navl text-left" aria-current={view===v?"page":undefined} onClick={()=>go(v)}>{l}</button>)}
        </div>
      )}
    </header>
  );
}

/* ================= COURSE CARD ================= */
// Row layout on phones (thumb left), stacked card from sm: upward.
function CourseCard({course,pct,onOpen}){
  return (
    <article className="bd rounded-xl overflow-hidden flex sm:flex-col" style={{background:"var(--bg)"}}>
      <Thumb course={course} className="w-28 sm:w-full h-auto sm:aspect-[16/9] object-cover shrink-0 self-stretch"/>
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1 min-w-0">
        <p className="text-xs mut">{course.cat} · {course.level}</p>
        <h3 className="font-bold leading-snug">{course.title}</h3>
        <p className="text-xs mut">{course.lectures} Lectures · {course.hours} Hours</p>
        <Bar pct={pct}/>
        <button className="btn mt-auto self-start text-sm" onClick={onOpen}>{pct>0&&pct<100?"Resume Lecture":pct===100?"Review Modules":"View Modules"}</button>
      </div>
    </article>
  );
}

/* ================= CATALOG ================= */
function Catalog({courses,progress,open,query,title="Browse courses",sub}){
  const [cat,setCat]=useState("All"), [lvl,setLvl]=useState("All");
  const list = courses.filter(c => (cat==="All"||c.cat===cat) && (lvl==="All"||c.level===lvl) && c.title.toLowerCase().includes(query.toLowerCase()));
  const Chips = ({items,val,set,label}) => (
    <div className="scroll-x flex gap-2 py-1" role="group" aria-label={label}>
      {["All",...items].map(x=><button key={x} className="chip" aria-pressed={val===x} onClick={()=>set(x)}>{x}</button>)}
    </div>
  );
  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="mut mt-1">{sub}</p>}
      <div className="mt-4 space-y-1"><Chips items={CATEGORIES} val={cat} set={setCat} label="Filter by topic"/><Chips items={LEVELS} val={lvl} set={setLvl} label="Filter by level"/></div>
      {list.length ? (
        <div className="mt-5 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(c=><CourseCard key={c.id} course={c} pct={progress(c)} onOpen={()=>open(c.id)}/>)}
        </div>
      ) : <p className="mut mt-8">No courses match these filters. Clear a filter or change your search.</p>}
    </section>
  );
}

/* ================= DASHBOARD ================= */
function Dashboard({courses,progress,open,go,done}){
  const active = courses.filter(c=>{const p=progress(c);return p>0&&p<100;});
  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, Ananya</h1>
        <p className="mut mt-1">{done} lessons completed across {courses.filter(c=>progress(c)>0).length} courses.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {active.slice(0,2).map(c=>(
            <button key={c.id} onClick={()=>open(c.id)} className="bd rounded-xl p-4 text-left flex gap-3 items-center hover:border-[var(--pri)] transition-colors">
              <Thumb course={c} className="w-16 h-16 rounded-lg object-cover shrink-0"/>
              <span className="flex-1 min-w-0"><span className="block font-bold truncate">{c.title}</span><span className="block mb-1 text-xs mut">Pick up where you left off</span><Bar pct={progress(c)}/></span>
            </button>))}
        </div>
      </section>
      <Catalog courses={courses} progress={progress} open={open} query="" title="Recommended for you"/>
    </div>
  );
}

/* ================= LECTURE PLAYER ================= */
function Player({course,completed,toggle,back}){
  const flat = useMemo(()=>course.sections.flatMap((s,si)=>s[1].map((t,li)=>({si,li,t,id:key(course.id,si,li)}))),[course]);
  const firstOpen = flat.find(x=>!completed.has(x.id)) || flat[0];
  const [cur,setCur] = useState(firstOpen.id);
  const [openSec,setOpenSec] = useState(new Set([firstOpen.si]));
  const [playing,setPlaying] = useState(false);
  const lesson = flat.find(x=>x.id===cur);
  const idx = flat.indexOf(lesson), next = flat[idx+1];
  const pick = x => { setCur(x.id); setPlaying(false); setOpenSec(s=>new Set(s).add(x.si)); window.scrollTo({top:0,behavior:"smooth"}); };
  const toggleSec = i => setOpenSec(s=>{const n=new Set(s); n.has(i)?n.delete(i):n.add(i); return n;});
  const doneCount = flat.filter(x=>completed.has(x.id)).length;
  const isDone = completed.has(cur);
  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <button className="text-sm font-medium mb-3" style={{color:"var(--pri)"}} onClick={back}>‹ All courses</button>
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* LEFT: video canvas + notes */}
        <div className="min-w-0">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <Thumb course={course} className="absolute inset-0 w-full h-full opacity-50"/>
            <button onClick={()=>setPlaying(!playing)} className="absolute inset-0 grid place-items-center text-white" aria-label={playing?"Pause lecture":"Play lecture"}>
              <span className="w-16 h-16 rounded-full grid place-items-center" style={{background:"var(--pri)",color:"var(--pri-fg)"}}>
                {playing ? <span className="font-bold">❚❚</span> : <Icon d={I.play} className="w-7 h-7"/>}
              </span>
            </button>
            <div className="absolute bottom-0 inset-x-0 p-3 text-white text-sm bg-gradient-to-t from-black/70 to-transparent flex justify-between">
              <span className="font-semibold">{lesson.t}</span><span>{playing?"Playing":"Ready"}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button className="btn" onClick={()=>toggle(cur)}>{isDone?"Mark incomplete":"Mark complete"}</button>
            {next && <button className="ghost" onClick={()=>{ if(!isDone) toggle(cur); pick(next); }}>Next lesson</button>}
          </div>
          <div className="notes mt-4" dangerouslySetInnerHTML={{__html:md(notesFor(course,lesson.t))}}/>
        </div>
        {/* RIGHT: sticky syllabus accordion */}
        <aside className="lg:sticky lg:top-20 bd rounded-xl overflow-hidden" aria-label="Course syllabus">
          <div className="p-4 bdb soft"><h2 className="font-bold">{course.title}</h2><div className="mt-2"><Bar pct={Math.round(doneCount/flat.length*100)}/></div></div>
          {course.sections.map(([name,lessons],si)=>{
            const open = openSec.has(si);
            return (
              <div key={name} className="bdb last:border-b-0">
                <button className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold min-h-[48px]" aria-expanded={open} onClick={()=>toggleSec(si)}>
                  <span>{name} <span className="mut font-normal text-xs">({lessons.filter((_,li)=>completed.has(key(course.id,si,li))).length}/{lessons.length})</span></span>
                  <Icon d={I.chev} className={`w-4 h-4 transition-transform ${open?"rotate-180":""}`}/>
                </button>
                {open && <ul>{lessons.map((t,li)=>{
                  const id=key(course.id,si,li), d=completed.has(id), active=id===cur;
                  return <li key={id}><button onClick={()=>pick({si,li,t,id})} aria-current={active?"true":undefined}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm min-h-[44px]" style={active?{background:"var(--soft)",color:"var(--pri)",fontWeight:600}:{}}>
                    <span className="w-5 h-5 rounded-full grid place-items-center shrink-0" style={d?{background:"var(--pri)",color:"var(--pri-fg)"}:{border:"1.5px solid var(--bd)"}}>{d&&<Icon d={I.check} className="w-3 h-3"/>}</span>
                    <span>{t}</span></button></li>;
                })}</ul>}
              </div>);
          })}
        </aside>
      </div>
    </div>
  );
}

/* ================= APP ================= */
function App(){
  const [view,setView] = useState("dashboard");
  const [courseId,setCourseId] = useState(null);
  const [query,setQuery] = useState("");
  const [courses,setCourses] = useState([]);
  const [completed,setCompleted] = useState(new Set());
  const [error,setError] = useState("");
  // Load the catalog and this student's progress from the API on first render.
  useEffect(()=>{
    Promise.all([api("/courses"),api("/progress")])
      .then(([c,p])=>{ setCourses(c); setCompleted(new Set(p)); })
      .catch(()=>setError("Could not reach the server. Start the API and refresh."));
  },[]);
  // Optimistic update, then persist; roll back if the request fails.
  const toggle = id => {
    const on = !completed.has(id);
    const flip = v => setCompleted(s=>{const n=new Set(s); v?n.add(id):n.delete(id); return n;});
    flip(on);
    api("/progress/"+encodeURIComponent(id),{method:"PUT",body:JSON.stringify({completed:on})}).catch(()=>flip(!on));
  };
  const progress = c => { let n=0; c.sections.forEach((s,si)=>s[1].forEach((_,li)=>{ if(completed.has(key(c.id,si,li))) n++; })); return Math.round(n/c.lectures*100); };
  const open = id => { setCourseId(id); setView("player"); window.scrollTo(0,0); };
  const course = courses.find(c=>c.id===courseId);
  const nav = v => { setView(v); window.scrollTo(0,0); };
  if(!courses.length) return <p className="max-w-6xl mx-auto px-4 py-10 mut" role="status">{error||"Loading courses…"}</p>;
  return (
    <>
      <Header view={view==="player"?"browse":view} setView={nav} query={query} setQuery={setQuery} done={completed.size}/>
      <main>
        {view==="dashboard" && <Dashboard courses={courses} progress={progress} open={open} go={nav} done={completed.size}/>}
        {view==="browse" && <Catalog courses={courses} progress={progress} open={open} query={query}/>}
        {view==="library" && <Catalog courses={courses.filter(c=>progress(c)>0)} progress={progress} open={open} query="" title="My Library" sub="Courses you have started."/>}
        {view==="player" && course && <Player key={course.id} course={course} completed={completed} toggle={toggle} back={()=>nav("browse")}/>}
      </main>
    </>
  );
}
export default App;
