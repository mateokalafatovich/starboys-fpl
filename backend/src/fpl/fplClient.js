import { ENDPOINTS } from "./endpoints";
import axios from 'axios';

/* Wrap fetch calls to FPL API endpoints */

// GET Request (fetch standings)
async function getStandingsData() {
    const response = await axios.get(ENDPOINTS.standings)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching standings', error);
    });
}

export {
    getStandings
};