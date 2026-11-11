export async function getJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return res.json();
}