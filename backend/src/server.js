import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectRedis, disconnectRedis } from './config/redis.js';

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
})

const PORT = process.env.PORT || 4000;

async function start() {
    // Connect Redis before accepting traffic
    await connectRedis();
    // Start listening
    httpServer.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

async function shutdown(signal) {
    console.log(`${signal} received, shutting down`);
    io.close();
    await disconnectRedis();
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
})