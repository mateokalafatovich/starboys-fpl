import { getJson } from './client';

export const getStandings = () => getJson('/api/league/standings');
export const getStandingsProgression = () => getJson('/api/league/standings/progression');