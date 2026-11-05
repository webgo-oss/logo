export async function fetchSections() {
  const res = await fetch('/api/logos/sections');
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}
