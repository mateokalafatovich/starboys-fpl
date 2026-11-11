export function toTotalPointsSeries(progression) {
  if (progression.length === 0) {
    return { labels: [], series: [] };
  }
  const byGameweek = new Map(progression.map((row) => [row.gameweek, row]));
  const gameweeks = [...byGameweek.keys()];
  const labels = Array.from({ length: Math.max(...gameweeks)}, (_, index) => index + 1);

  const teams = [...new Set(
    progression.flatMap((row) => Object.keys(row).filter((key) => key !== 'gameweek'))
  )].sort();

  const series = teams.map((name) => ({
    name,
    values: labels.map((gameweek) => byGameweek.get(gameweek)?.[name] ?? null),
  }));

  return { labels, series };
}