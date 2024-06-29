import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { User } from '@db/dbAccessor';

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

if ((JWT_SECRET == null) || (JWT_EXPIRES_IN == null)) {
    throw new Error('Environment variables JWT_SECRET and JWT_EXPIRES_IN must be defined');
}

export const generateAccessToken = (user: User): string => {
    const payload = {
        userId: user.id,
        email: user.email,
    };

    const options = {
        expiresIn: JWT_EXPIRES_IN,
    };

    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
};