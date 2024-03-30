import dotenv from 'dotenv';

import http from 'http';
import express from 'express'
import { dataSource } from '../db/DataSource'
import { setupMiddleware } from "./middleware"
import { SocketHandler } from "./services/socketHandler"
import { Server } from 'socket.io';

import sessionRoutes from './routes/userRoutes';
dotenv.config();

// Establish database connection.
dataSource
  .initialize()
  .then(() => {
    console.log("Data source has been initialized");
  })
  .catch(() => {
    console.log("Error during Data Source initialization");
  })

// Create and setup express app.
const app = express();
app.use(express.json())
const port = 3000;

// Create a listener for socket connections
const httpServer = http.createServer(app);
const io = new Server(httpServer); // Fix: Use the Server class to create the io instance
const socketHandler: SocketHandler = new SocketHandler(io);
console.log('SocketHandler', socketHandler);

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