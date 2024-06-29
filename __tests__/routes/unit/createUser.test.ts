import { Request, Response } from 'express';
import { userManager } from '@services/userManager';
import { createUser } from '@routes/createUser';

// Mock dependencies
jest.mock('../../../src/services/userManager');

describe('createUser', () => {
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

        await createUser(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'All input is required' });
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

        await createUser(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email is already in use' });
    });

    it('should return 201 and userId if user is created successfully', async () => {
        req.body = { email: 'test@example.com', username: 'testuser', password: 'testpassword' };
        (userManager.getUserByEmail as jest.Mock).mockResolvedValue(null);
        (userManager.createUser as jest.Mock).mockResolvedValue('new-user-id');

        await createUser(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ userId: 'new-user-id' });
    });

    it('should return 500 if there is a server error', async () => {
        req.body = { email: 'test@example.com', username: 'testuser', password: 'testpassword' };
        (userManager.getUserByEmail as jest.Mock).mockRejectedValue(new Error('Database error'));

        await createUser(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
});