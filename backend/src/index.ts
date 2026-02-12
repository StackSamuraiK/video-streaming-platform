import express from 'express';
import dotenv from 'dotenv';
// Load environment variables BEFORE imports that might use them (like cloudinary config)
dotenv.config();

import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './db';
import authRoutes from './routes/authRoutes';
import videoRoutes from './routes/videoRoutes';

connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

app.get('/', (req, res) => {
    res.send('Video Streaming Platform Backend Running');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

export { io };

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
