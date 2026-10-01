// Seed data: loaded into SQLite on first run (see db.js).
const CATEGORIES = ["Tech & Systems Architecture", "Creative Layout Arts", "Management Dynamics"];
export default [
  { id:"react", cat:CATEGORIES[0], level:"Intermediate", title:"React Ecosystem Mastery", hours:4.8, hue:220,
    sections:[["Foundations",["Components as functions","State and props","Effects without surprises"]],["Scaling up",["Context and reducers","Routing and data loading","Performance profiling"]]] },
  { id:"api", cat:CATEGORIES[0], level:"Advanced", title:"API Design Paradigms", hours:5.2, hue:250,
    sections:[["Contracts",["Resources and verbs","Versioning strategies","Error models"]],["Operating APIs",["Pagination and caching","Rate limiting","Observability"]]] },
  { id:"type", cat:CATEGORIES[1], level:"Beginner", title:"UI Typography Principles", hours:3.4, hue:200,
    sections:[["Letterforms",["Anatomy of a typeface","Choosing a pairing","Scale and rhythm"]],["On screen",["Line length and leading","Responsive type","Accessible contrast"]]] },
  { id:"edit", cat:CATEGORIES[1], level:"Intermediate", title:"Editorial Graphic Systems", hours:4.1, hue:280,
    sections:[["Grids",["Columns and gutters","Modular grids","Breaking the grid"]],["Systems",["Hierarchy in print","Image and caption","Building a style guide"]]] },
  { id:"remote", cat:CATEGORIES[2], level:"Beginner", title:"Remote Team Frameworks", hours:3.9, hue:170,
    sections:[["Foundations",["Async-first habits","Writing for teammates","Meeting hygiene"]],["Culture",["Onboarding remotely","Trust and feedback","Time zone fairness"]]] },
  { id:"agile", cat:CATEGORIES[2], level:"Advanced", title:"Agile Execution Loops", hours:4.6, hue:20,
    sections:[["Planning",["Slicing work thin","Estimating honestly","Sprint goals"]],["Delivery",["Standups that help","Retrospectives with teeth","Measuring flow"]]] },
];

// Lessons the demo student has already completed.
export const SEED_PROGRESS = ["react:0:0", "react:0:1", "react:0:2", "react:1:0", "type:0:0", "type:0:1", "agile:0:0"];
