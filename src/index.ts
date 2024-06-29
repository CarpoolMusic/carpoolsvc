import dotenv from 'dotenv';

import http from 'http';
import express from 'express'
import { SocketHandler } from "./services/socketHandler"
import { setupMiddleware } from "./server/middleware"
import { Server } from 'socket.io';

import sessionRoutes from './routes/userRoutes';
dotenv.config();

// Create and setup express app.
const app = express();
app.use(express.json())
const port = 3000;

// Create a listener for socket connections
const httpServer = http.createServer(app);
const io = new Server(httpServer); // Fix: Use the Server class to create the io instance
const socketHandler: SocketHandler = new SocketHandler(io);
socketHandler.initializeSocketEvents();

// Setup middleware.
setupMiddleware(app);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.use('/api', sessionRoutes);


httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});