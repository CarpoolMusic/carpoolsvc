import dotenv from 'dotenv';

import http from 'http';
import express from 'express'
import { dataSource } from '../db/DataSource'
import { setupMiddleware } from "./middleware"
import { SocketHandler } from "./services/socketHandler"
import SessionManager from "./services/sessionManager"
import { Server } from 'socket.io';
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
const sessionManager: SessionManager = new SessionManager();
const socketHandler: SocketHandler = new SocketHandler(io, sessionManager);
console.log('SocketHandler', socketHandler);

// Setup middleware.
setupMiddleware(app);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});