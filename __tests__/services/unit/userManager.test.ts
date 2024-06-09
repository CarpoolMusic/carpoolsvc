import bcrypt from 'bcrypt';
import { UserManager } from '../../../src/services/userManager';
import { User } from '../../../db/dbAccessor';
import type { IDBAccessor } from '../../../db/dbAccessor';
import { Pool } from 'pg';

jest.mock('bcrypt');
jest.mock('../../../db/dbAccessor');

describe('UserManager', () => {
    let dbAccessorMock: jest.Mocked<IDBAccessor>;
    let userManager: UserManager;
    const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        dbAccessorMock = {
            getUserByEmail: jest.fn(),
            insertUser: jest.fn(),
            // Add other methods if needed
        } as unknown as jest.Mocked<IDBAccessor>;

        console.log(process.env.DATABASE_URL);
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: true
            }
        });
        userManager = new UserManager(dbAccessorMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get a user by email', async () => {
        dbAccessorMock.getUserByEmail.mockResolvedValue(mockUser);

        const user = await userManager.getUserByEmail(mockUser.email);
        expect(user).toEqual(mockUser);
        expect(dbAccessorMock.getUserByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should throw an error when getUserByEmail fails', async () => {
        dbAccessorMock.getUserByEmail.mockRejectedValue(new Error('DB error'));

        await expect(userManager.getUserByEmail(mockUser.email)).rejects.toThrow('Error fetching user by email');
    });

    it('should compare passwords correctly', async () => {
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await userManager.comparePassword(mockUser.password_hash, 'provided_password');
        expect(result).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith('provided_password', mockUser.password_hash);
    });

    it('should throw an error when comparePassword fails', async () => {
        (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('bcrypt error'));

        await expect(userManager.comparePassword(mockUser.password_hash, 'provided_password')).rejects.toThrow('Error comparing passwords');
    });

    it('should create a user', async () => {
        dbAccessorMock.insertUser.mockResolvedValue(mockUser.id);

        const userId = await userManager.createUser(mockUser.id, mockUser.email, mockUser.password_hash);
        expect(userId).toBe(mockUser.id);
        expect(dbAccessorMock.insertUser).toHaveBeenCalledWith(mockUser.email, mockUser.password_hash);
    });

    it('should throw an error when createUser fails', async () => {
        dbAccessorMock.insertUser.mockRejectedValue(new Error('DB error'));

        await expect(userManager.createUser(mockUser.id, mockUser.email, mockUser.password_hash)).rejects.toThrow('Error creating user');
    });
});