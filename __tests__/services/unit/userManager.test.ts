import bcrypt from 'bcrypt';
import { UserManager } from '@services/userManager';
import { User } from '../../../src/models/user';
import type { IDBAccessor } from '@db/dbAccessor';

jest.mock('bcrypt');
jest.mock('@db/dbAccessor');

describe('UserManager', () => {
    let dbAccessorMock: jest.Mocked<IDBAccessor>;
    let userManager: UserManager;
    const mockUser = new User(
        '1',
        'test@example.com',
        null,
        'hashed_password',
        new Date(),
        new Date(),
    );

    beforeEach(() => {
        dbAccessorMock = {
            getUserByEmailOrUsername: jest.fn(),
            insertUser: jest.fn(),
            // Add other methods if needed
        } as unknown as jest.Mocked<IDBAccessor>;

        userManager = new UserManager(dbAccessorMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get a user by email', async () => {
        dbAccessorMock.getUserByEmailOrUsername.mockResolvedValue(mockUser);

        const user = await userManager.getUserByEmailOrUsername(mockUser.email);
        expect(user).toEqual(mockUser);
        expect(dbAccessorMock.getUserByEmailOrUsername).toHaveBeenCalledWith(mockUser.email);
    });

    it('should throw an error when getUserByEmailOrUsername fails', async () => {
        dbAccessorMock.getUserByEmailOrUsername.mockRejectedValue(new Error('Error fetching user by email'));

        await expect(userManager.getUserByEmailOrUsername(mockUser.email)).rejects.toThrow('Error fetching user by email');
    });

    it('should compare passwords correctly', async () => {
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await userManager.comparePassword(mockUser.password_hash, 'provided_password');
        expect(result).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith('provided_password', mockUser.password_hash);
    });

    it('should throw an error when comparePassword fails', async () => {
        (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Error comparing passwords'));

        await expect(userManager.comparePassword(mockUser.password_hash, 'provided_password')).rejects.toThrow('Error comparing passwords');
    });

    it('should create a user', async () => {
        dbAccessorMock.insertUser.mockResolvedValue(mockUser.id);

        const userId = await userManager.createAccount(mockUser.email, mockUser.username, mockUser.password_hash);
        expect(dbAccessorMock.insertUser).toHaveBeenCalledWith(mockUser.email, mockUser.username, mockUser.password_hash);
        expect(userId).toBe(mockUser.id);
    });

    it('should throw an error when createAccount fails', async () => {
        dbAccessorMock.insertUser.mockRejectedValue(new Error('Error creating user'));

        await expect(userManager.createAccount(mockUser.id, mockUser.email, mockUser.password_hash)).rejects.toThrow('Error creating user');
    });
});