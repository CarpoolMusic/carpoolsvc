import { Express } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

export const setupMiddleware = (app: Express) => {
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(cors());
};