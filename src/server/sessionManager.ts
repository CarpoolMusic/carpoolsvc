import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { User } from '../models/user';

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = process.env;

if (!JWT_SECRET || !JWT_EXPIRES_IN || !JWT_REFRESH_SECRET || !JWT_REFRESH_EXPIRES_IN) {
    throw new Error('Environment variables JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, and JWT_REFRESH_EXPIRES_IN must be defined');
}

export const generateAccessToken = (user: User): string => {
    return generateToken(user, JWT_SECRET, JWT_EXPIRES_IN);
};

export const generateRefreshToken = (user: User): string => {
    const token = generateToken(user, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN);

    user.updateRefreshTokenHash(token);

    return token;
};

const generateToken = (user: User, secret: string, expiry: string): string => {
    const payload = {
        userId: user.id,
        email: user.email,
    };

    const options = {
        expiresIn: expiry,
    };

    return jwt.sign(payload, secret, options);
}