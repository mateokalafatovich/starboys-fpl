import express from 'express';
import cors from 'cors';
import leagueRoutes from './routes/league.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok'}));

app.use('/api/league', leagueRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: 'Internal server erro'
    });
})

export default app;