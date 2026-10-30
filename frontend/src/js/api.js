export async function getStandings() {
    const res = await fetch("/api/league/standings");
    if (!res.ok) {
        throw new Error(`Standings request failed: ${res.status}`);
    }
    return res.json();
}