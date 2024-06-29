import { Request, Response } from 'express';
import { login } from '@routes/login';
import { userManager } from '@services/userManager';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../../../src/server/sessionManager';
import type { User } from '@db/dbAccessor.ts';

// Mock dependencies
jest.mock('carpoolsvc/src/services/userManager');
jest.mock('bcrypt');
jest.mock('carpoolsvc/src/server/sessionManager');

const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});
afterAll(() => {
    console.error = originalConsoleError;
});

describe('login', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockUser: User;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockUser = {
            id: '1',
            username: null,
            email: 'test@example.com',
            password_hash: 'hashedpassword',
            created_at: new Date(),
            updated_at: new Date(),
        };
    });

    it('should return 400 if email or password is not provided', async () => {
        req.body = { identifier: '', password: '' };

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Username and password are required' });
    });

    it('should return 400 if user does not exist', async () => {
        req.body = { identifier: 'nonexistent@example.com', password: 'password' };
        (userManager.getUserByEmailOrUsername as jest.Mock).mockResolvedValue(null);

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username' });
    });

    it('should return 400 if password is invalid', async () => {
        req.body = { identifier: 'test@example.com', password: 'wrongpassword' };
        (userManager.getUserByEmailOrUsername as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
    });

    it('should return 200 and a token if login is successful', async () => {
        req.body = { identifier: 'test@example.com', password: 'password' };
        (userManager.getUserByEmailOrUsername as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (generateAccessToken as jest.Mock).mockReturnValue('fake-jwt-token');

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: 'fake-jwt-token' });
    });

    it('should return 500 if there is a server error', async () => {
        req.body = { identifier: 'test@example.com', password: 'password' };
        (userManager.getUserByEmailOrUsername as jest.Mock).mockRejectedValue(new Error('Database error'));

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
});