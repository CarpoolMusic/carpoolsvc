import express from 'express'
import { dataSource } from '../db/DataSource'
import { User } from "../db/User/user";
import { setupMiddleware } from "./middleware"
import { SocketHandler } from "./services/socketHandler"
import SessionManager from "./services/sessionManager"

// Establish database connection.
dataSource
  .initialize()
  .then(() => {
    console.log("Data source has been initialized");
  })
  .catch((err) => {
    console.log("Error during Data Source initialization");
  })

// Create and setup express app.
const app = express();
app.use(express.json())
const port = 3000;

// Create a listener for socket connections
const http = require('http');
const socketIo = require('socket.io');
const httpServer = http.createServer(app);
const io = socketIo(httpServer);
const sessionManager: SessionManager = new SessionManager();
const socketHandler: SocketHandler = new SocketHandler(io, sessionManager);

// Setup middleware.
setupMiddleware(app);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});