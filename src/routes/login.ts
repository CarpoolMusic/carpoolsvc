import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { userManager } from '../services/userManager';
import { generateAccessToken, generateRefreshToken } from '../server/sessionManager';
import type { LoginRequest, LoginResponse } from '../schema/socketEventSchema';
import type { User } from '../models/user';

export const login = async (req: Request, res: Response): Promise<Response> => {
    const body: LoginRequest = req.body;
    const { identifier, password } = body;

    // Validate user input
    if (!identifier || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user: User | null = await userManager.getUserByEmailOrUsername(identifier);
        if (!user) {
            return res.status(400).json({ message: 'Invalid username' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const accessToken: string = generateAccessToken(user);
        const refreshToken: string = generateRefreshToken(user);

        const saltRounds = 10;
        const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);

        // Store refresh token to later compare with the one sent by the client
        await userManager.updateUserRefreshTokenHash(user.id, hashedRefreshToken);

        const response: LoginResponse = { accessToken, refreshToken };
        return res.status(200).json(response);

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};