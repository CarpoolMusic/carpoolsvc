import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { userManager } from '../services/userManager';
import { generateAccessToken } from '../server/sessionManager';
import type { LoginRequest } from '../schema/socketEventSchema';
import type { User } from '../../src/db/dbAccessor';

export const login = async (req: Request, res: Response): Promise<Response> => {
    const body: LoginRequest = req.body;
    const { identifier, password } = body;

    // Validate user input
    if (!identifier || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await userManager.getUserByEmailOrUsername(identifier);
        if (!user) {
            return res.status(400).json({ message: 'Invalid username' });
        }

        // Check if password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = generateAccessToken(user);

        // Respond with token
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};