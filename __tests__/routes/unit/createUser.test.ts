import { Request, Response } from 'express';
import { userManager } from '@services/userManager';
import { createAccount } from '@routes/createAccount';

// Mock dependencies
jest.mock('../../../src/services/userManager');

describe('createAccount', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should return 400 if email, username, or password is not provided', async () => {
        req.body = { email: '', username: '', password: '' };

        await createAccount(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });

    it('should return 400 if email is already in use', async () => {
        req.body = { email: 'test@example.com', username: 'testuser', password: 'testpassword' };
        (userManager.getUserByEmail as jest.Mock).mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            password_hash: 'hashedpassword',
            created_at: new Date(),
            updated_at: new Date(),
        });

        await createAccount(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email is already in use' });
    });

    it('should return 201 and userId if user is created successfully', async () => {
        req.body = { email: 'test@example.com', username: 'testuser', password: 'testpassword' };
        (userManager.getUserByEmail as jest.Mock).mockResolvedValue(null);
        (userManager.createAccount as jest.Mock).mockResolvedValue('new-user-id');

        await createAccount(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ userId: 'new-user-id' });
    });

    it('should return 500 if there is a server error', async () => {
        req.body = { email: 'test@example.com', username: 'testuser', password: 'testpassword' };
        (userManager.getUserByEmail as jest.Mock).mockRejectedValue(new Error('Database error'));

        await createAccount(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
});