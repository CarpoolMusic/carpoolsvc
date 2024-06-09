// UserManager.ts
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { type User, type IDBAccessor, DBAccessor } from '../../src/db/dbAccessor';

export interface IUserManager {
    getUserByEmail: (email: string) => Promise<User | null>;
    comparePassword: (storedPasswordHash: string, providedPassword: string) => Promise<boolean>;
    createUser: (id: string, email: string, passwordHash: string) => Promise<string>;
}

export class UserManager {

    private readonly dbAccessor: IDBAccessor;

    constructor(dbAccessor: IDBAccessor) {
        this.dbAccessor = dbAccessor;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            return await this.dbAccessor.getUserByEmail(email);
        } catch (err) {
            throw new Error(`Error fetching user by email with error ${err}`);
        }
    }

    async comparePassword(storedPasswordHash: string, providedPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(providedPassword, storedPasswordHash);
        } catch (err) {
            throw new Error('Error comparing passwords');
        }
    }

    async createUser(id: string, email: string, passwordHash: string): Promise<string> {
        try {
            return await this.dbAccessor.insertUser(email, passwordHash);
        } catch (err) {
            throw new Error('Error creating user');
        }
    }
}

const pool: Pool = new Pool({
    host: 'db', // Use the service name defined in docker-compose.yml
    user: 'root',
    password: 'jam',
    database: 'carpooldb',
    port: 5432,
});
// const pool: Pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//         rejectUnauthorized: true
//     }
// });
const dbAccessor = new DBAccessor(pool);
export const userManager = new UserManager(dbAccessor);