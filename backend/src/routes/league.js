import { Router } from 'express';
import { getLeagueStandings, getStandingsProgression, getRankingsProgression } from '../services/leagueService.js';

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

router.get('/standings/progression', async(req, res) => {
    try {
        const progression = await getStandingsProgression();
        res.json(progression);
    } catch(err) {
        console.error('Error fetching standings progression:', err);
        res.status(500).json({
            error: 'Failed to fetch standings progression'
        });
    }
});

router.get('/rankings/progression', async(req, res) => {
    try {
        const progression = await getRankingsProgression();
        res.json(progression);
    } catch(err) {
        console.error('Error fetching rankings progression:', err);
        res.status(500).json({
            error: 'Failed to fetch rankings progression'
        });
    }
}); 

export default router;