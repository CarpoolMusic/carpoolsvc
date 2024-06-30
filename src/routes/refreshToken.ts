import express, { Request, Response } from 'express';
import type { RefreshTokenRequest } from '@schema/socketEventSchema';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { userManager } from '@services/userManager';
import { generateAccessToken } from '../server/sessionManager';
import { User } from '../models/user';
import bcrypt from 'bcrypt';

export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const body: RefreshTokenRequest = req.body;
    const { userId, refreshToken } = body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        const user: User | null = await userManager.getUserById(userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const userRefreshTokenHash = await user.getRefreshTokenHash();
        if (!userRefreshTokenHash) {
            return res.status(401).json({ message: 'User does not have a refresh token' });
        }

        // Ensure this refresh token belongs to the user
        if (!bcrypt.compare(refreshToken, userRefreshTokenHash)) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // verify the refresh token
        try {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
        } catch (error) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        // If valid refresh token, generate and send a new access token
        const accessToken = generateAccessToken(user);
        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error when fetching refresh token' });
    }
};