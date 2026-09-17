import { Router } from 'express';
import { getLeagueStandings } from '../services/leagueService.js';

const router = Router();

router.get('/standings', async(req, res) => {
    try {
        const standings = await getLeagueStandings();
        res.json(standings);
    } catch(err) {
        console.error('Error fetching standings:', err);
        res.status(500).json({
            error: 'Failed to fetch standings'
        });
    }
});

export default router;