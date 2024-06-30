import { type Express } from 'express';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

export const setupMiddleware = (app: Express): void => {
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(cors());
};

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export { authenticateJWT };