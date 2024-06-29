import { type Request, type Response } from 'express';
import type { CreateUserRequest } from '@schema/socketEventSchema';
import { userManager } from '../services/userManager';  // Ensure correct path

/**
 * Creates a new user.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to a response object.
 */
export const createUser = async (req: Request, res: Response): Promise<Response> => {
    const body: CreateUserRequest = req.body;
    const { email, username, password } = body;

    // Validate user input
    if (!email || !username || !password) {
        return res.status(400).json({ message: 'All input is required' });
    }

    try {
        const existingUser = await userManager.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const userId = await userManager.createUser(email, username, password);
        return res.status(201).json({ userId });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
