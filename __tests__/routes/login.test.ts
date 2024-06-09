import { Request, Response } from 'express';
import { login } from '../../src/routes/login';
import { userManager } from '../../src/services/userManager';
import bcrypt from 'bcrypt';
import { sessionManager } from '../../src/services/musicSessionManager';
import { generateAccessToken } from '../../src/sessionManager';
import type { User } from '../../db/dbAccessor';

// Mock dependencies
jest.mock('../services/userManager');
jest.mock('bcrypt');
jest.mock('./sessionManager');

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
            email: 'test@example.com',
            password_hash: 'hashedpassword',
            created_at: new Date(),
            updated_at: new Date(),
        };
    });

    it('should return 400 if username or password is not provided', async () => {
        req.body = { username: '', password: '' };

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'All input is required' });
    });

    it('should return 400 if user does not exist', async () => {
        req.body = { username: 'nonexistent@example.com', password: 'password' };
        (userManager.getUserByEmail as jest.Mock).mockResolvedValue(null);

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Username' });
    });

    it('should return 400 if password is invalid', async () => {
        req.body = { username: 'test@example.com', password: 'wrongpassword' };
        (userManager.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Password' });
    });

    it('should return 200 and a token if login is successful', async () => {
        req.body = { username: 'test@example.com', password: 'password' };
        (userManager.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (generateAccessToken as jest.Mock).mockReturnValue('fake-jwt-token');

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: 'fake-jwt-token' });
    });

    it('should return 500 if there is a server error', async () => {
        req.body = { username: 'test@example.com', password: 'password' };
        (userManager.getUserByEmail as jest.Mock).mockRejectedValue(new Error('Database error'));

        await login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
});