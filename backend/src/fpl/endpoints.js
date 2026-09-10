const BASE_URL = 'https://fantasy.premierleague.com';

export const ENDPOINTS = {
    bootstrap: `${BASE_URL}/api/bootstrap-static/`,
    standings: (leagueId) => `${BASE_URL}/api/leagues-classic/${leagueId}/standings/`
};
