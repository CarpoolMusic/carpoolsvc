import { Pool } from 'pg';
import { DBAccessor } from '../../../src/db/dbAccessor';
import { User } from '../../../src/models/user';
import { v4 as uuidv4 } from 'uuid';

describe('DBAccessor', () => {
    let pool: Pool;
    let mockUser: User;
    let dbAccessor: DBAccessor;

    beforeAll(() => {
        pool = new Pool({
            host: 'db', // Use the service name defined in docker-compose.yml
            user: 'root',
            password: 'jam',
            database: 'carpooldb',
            port: 5432,
        });

        dbAccessor = new DBAccessor(pool);

        mockUser = new User(
            uuidv4(),
            'test@example.com',
            null,
            'hashed_password',
            new Date(),
            new Date(),
        );
    });

    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        // Clean up by deleting the test user
        if (mockUser.id) {
            await dbAccessor.deleteUserById(mockUser.id);
        }
    });

    it('should insert a user and return the user id', async () => {
        // Insert the mock user and get the id
        const userId = await dbAccessor.insertUser(mockUser.email, mockUser.username, mockUser.password_hash);
        expect(userId).toBeDefined();

        // Try and fetch the user by email and ensure it matches the mock user
        const user: User | null = await dbAccessor.getUserByEmailOrUsername(mockUser.email);
        expect(user).not.toBeNull();
        expect(user?.id).toBeDefined();
        expect(user?.username).toEqual(mockUser.username);

        // Clean up by deleting the test user
        await dbAccessor.deleteUserById(user!.id);
        // Assert the user no longer exists
        const deletedUser = await dbAccessor.getUserByEmailOrUsername(mockUser.email);
        expect(deletedUser).toBeUndefined();

    });

    it('should delete a user by id', async () => {
        // Insert the mock user and get the id
        const userId = await dbAccessor.insertUser(mockUser.email, mockUser.username, mockUser.password_hash);
        expect(userId).toBeDefined();

        // Delete the user by id
        await dbAccessor.deleteUserById(userId);

        // Try and fetch the user by email and ensure it no longer exists
        const user = await dbAccessor.getUserByEmailOrUsername(mockUser.email);
        expect(user).toBeUndefined();
    });
});