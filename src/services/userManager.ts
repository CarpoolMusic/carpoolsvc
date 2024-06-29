/* eslint-disable @typescript-eslint/restrict-template-expressions */
// UserManager.ts
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { type User, type IDBAccessor, DBAccessor } from '../db/dbAccessor';

export interface IUserManager {
    getUserByEmailOrUsername: (email: string) => Promise<User | null>;
    comparePassword: (storedPasswordHash: string, providedPassword: string) => Promise<boolean>;
    createUser: (id: string, email: string, passwordHash: string) => Promise<string>;
}

export class UserManager {

    private readonly dbAccessor: IDBAccessor;

    constructor(dbAccessor: IDBAccessor) {
        this.dbAccessor = dbAccessor;
    }

    async getUserByEmailOrUsername(identifier: string): Promise<User | null> {
        try {
            return await this.dbAccessor.getUserByEmailOrUsername(identifier);
        } catch (err) {
            throw new Error(`Error fetching user by identifier with error ${err}`);
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            return await this.dbAccessor.getUserByEmail(email);
        } catch (err) {
            throw new Error(`Error fetching user by email with error ${err}`);
        }
    }

    async getUserByUsername(identifier: string): Promise<User | null> {
        try {
            return await this.dbAccessor.getUserByUsername(identifier);
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

    async createUser(email: string, username: string | null, passwordHash: string): Promise<string> {
        try {
            return await this.dbAccessor.insertUser(email, username, passwordHash);
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