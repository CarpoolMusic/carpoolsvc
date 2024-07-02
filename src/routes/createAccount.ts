import { type Request, type Response } from 'express';
import type { CreateAccountRequest, CreateAccountResponse } from '@schema/socketEventSchema';
import { userManager } from '../services/userManager';  // Ensure correct path

import bcrypt from 'bcrypt';

/**
 * Creates a new user.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to a response object.
 */
export const createAccount = async (req: Request, res: Response): Promise<Response> => {
    const body: CreateAccountRequest = req.body;
    const { email, username, password } = body;

    // Validate user input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const existingUser = await userManager.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }
        if (username) {
            const existingUsername = await userManager.getUserByUsername(username);
            if (existingUsername) {
                return res.status(400).json({ message: 'Username is already in use' });
            }
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userId = await userManager.createAccount(email, username, hashedPassword);
        const response: CreateAccountResponse = { userId };
        console.log(response);
        return res.status(201).json(response);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
