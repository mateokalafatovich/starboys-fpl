import { ENDPOINTS } from "./endpoints.js";
import axios from 'axios';

/* Wrap fetch calls to FPL API endpoints */

// GET Request (fetch standings)
async function getStandingsData(leagueId) {
  try {
    const response = await axios.get(ENDPOINTS.standings);
    return response.data;
  } catch (err) {
    console.error(`Error fetching standings for league ${leagueId}`, err.message);
  }
}

async function getCurrentGameweek() {
  try {
    const response = await axios.get(ENDPOINTS.bootstrap);
    const currentEvent = response.data.events.find((e) => e.is_current);
    if (!currentEvent) {
      throw new Error('No current gameweek found in bootstrap-static');
    }
    return currentEvent.id;
  } catch (err) {
    console.error('Error fetching current gameweek:', err.message);
    throw error;
  }
}

export {
    getStandingsData,
    getCurrentGameweek
};