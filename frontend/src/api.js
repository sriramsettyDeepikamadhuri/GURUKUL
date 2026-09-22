const BASE_URL = import.meta.env.VITE_API_URL || "/api";
async function handle(res) { if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Request failed with ${res.status}`); return res.json(); }
export async function getBooks({ search="", genre="All", language="All" }={}) { const p=new URLSearchParams({search,genre,language}); return handle(await fetch(`${BASE_URL}/books?${p}`)); }
export async function getMeta() { return handle(await fetch(`${BASE_URL}/meta`)); }
export async function getRecommendations({languages=[],interests=[],excludeId,limit=8}={}) { const p=new URLSearchParams({languages:languages.join(","),interests:interests.join(","),limit}); if(excludeId)p.set("excludeId",excludeId); return handle(await fetch(`${BASE_URL}/recommend?${p}`)); }
