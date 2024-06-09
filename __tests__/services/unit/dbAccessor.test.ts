import { Pool } from 'pg';
import { DBAccessor, User } from '../../../db/dbAccessor';
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

        // Initialize mock user data
        mockUser = {
            id: uuidv4(),
            email: 'test@example.com',
            password_hash: 'hashed_password',
            created_at: new Date(),
            updated_at: new Date(),
        };
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
        const userId = await dbAccessor.insertUser(mockUser.email, mockUser.password_hash);
        expect(userId).toBeDefined();
        mockUser.id = userId;

        // Try and fetch the user by email and ensure it matches the mock user
        const user = await dbAccessor.getUserByEmail(mockUser.email);
        expect(user).not.toBeNull();
        expect(user).toEqual(expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            password_hash: mockUser.password_hash,
        }));
    });

    it('should delete a user by id', async () => {
        // Insert the mock user and get the id
        const userId = await dbAccessor.insertUser(mockUser.email, mockUser.password_hash);
        expect(userId).toBeDefined();

        // Delete the user by id
        await dbAccessor.deleteUserById(userId);

        // Try and fetch the user by email and ensure it no longer exists
        const user = await dbAccessor.getUserByEmail(mockUser.email);
        expect(user).toBeUndefined();
    });
});