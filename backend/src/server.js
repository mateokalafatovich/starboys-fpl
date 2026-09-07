import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
})

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Backend running on port ${PORT}`));