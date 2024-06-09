import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { userManager } from '../services/userManager';
import { generateAccessToken } from '../sessionManager';
import type { LoginRequest } from '../schema/socketEventSchema';
import type { User } from '../../src/db/dbAccessor';

export const login = async (req: Request, res: Response): Promise<Response> => {
    const body: LoginRequest = req.body;
    const { username, password } = body;

    try {
        // Validate user input
        console.log(username, password);
        if (!username && !password) {
            return res.status(400).json({ message: 'All input is required' });
        }

        // Retrieve user from database
        const user: User | null = await userManager.getUserByEmail(username);

        // Check if user exists
        if (!user) {
            return res.status(400).json({ message: 'Invalid Username' });
        }

        console.log("USER", user);

        // Check if password is valid
        if (!(await bcrypt.compare(password, user.password_hash))) {
            return res.status(400).json({ message: 'Invalid Password' });
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