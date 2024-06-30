import { Request, Response } from 'express';
import { refreshToken } from '@routes/refreshToken';
import { userManager } from '@services/userManager';
import { generateAccessToken } from '../../../src/server/sessionManager';
import { authenticateJWT } from '@server/middleware';
import { User } from '../../../src/models/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('../../../src/services/userManager');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../src/server/sessionManager');
jest.mock('../../../src/server/middleware');

describe('refreshToken', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    const mockUser = new User(
        '1',
        'test@example.com',
        'testuser',
        'hashed_password',
        new Date(),
        new Date(),
    );

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        (userManager.getUserById as jest.Mock).mockResolvedValue(mockUser);
        (userManager.getRefreshTokenHash as jest.Mock).mockResolvedValue('hashed_refresh_token');
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.verify as jest.Mock).mockImplementation((token, secret) => {
            if (token === 'valid_refresh_token') {
                return { userId: mockUser.id, email: mockUser.email };
            } else {
                throw new Error('Invalid token');
            }
        });
        (generateAccessToken as jest.Mock).mockReturnValue('new_access_token');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if refresh token is not provided', async () => {
        req.body = { userId: '1' };

        await refreshToken(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token is required' });
    });

    it('should return 403 if refresh token is invalid', async () => {
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        req.body = { userId: '1', refreshToken: 'invalid_refresh_token' };

        await refreshToken(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired refresh token' });
    });

    it('should return 200 and a new access token if refresh token is valid', async () => {
        req.body = { userId: '1', refreshToken: 'valid_refresh_token' };

        await refreshToken(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ accessToken: 'new_access_token' });
    });

    it('should return 500 if there is a server error', async () => {
        (userManager.getUserById as jest.Mock).mockRejectedValue(new Error('Database error'));

        req.body = { userId: '1', refreshToken: 'valid_refresh_token' };

        await refreshToken(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error when fetching refresh token' });
    });
});