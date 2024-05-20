import dotenv from 'dotenv';

import http from 'http';
import express from 'express'
import { setupMiddleware } from "./middleware"
import { SocketHandler } from "./services/socketHandler"
import { Server } from 'socket.io';
import { Pool } from 'pg';

import sessionRoutes from './routes/userRoutes';
import { UserManager } from './services/userManager'; // Fix: Correct the path to import the UserManager module
import { DBAccessor } from '../db/dbAccessor';
dotenv.config();

// Create and setup express app.
const app = express();
app.use(express.json())
const port = 3000;

// Create a listener for socket connections
const httpServer = http.createServer(app);
const io = new Server(httpServer); // Fix: Use the Server class to create the io instance
const socketHandler: SocketHandler = new SocketHandler(io);
console.log('SocketHandler', socketHandler);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true
  }
});
const dbAccessor = new DBAccessor(pool);

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

export const userManager = new UserManager(dbAccessor);