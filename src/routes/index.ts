import express from 'express';
import { dataSource } from '../db/DataSource';
import { User } from "../db/User/user";
import { setupMiddleware } from "./middleware"

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

// Setup middleware.
setupMiddleware(app);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});