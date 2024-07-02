/* eslint-disable @typescript-eslint/restrict-template-expressions */
// UserManager.ts
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { type IDBAccessor, DBAccessor } from '@db/dbAccessor';
import { type User } from '@models/user';

export interface IUserManager {
    getUserByEmailOrUsername: (email: string) => Promise<User | null>;
    getUserByEmail: (email: string) => Promise<User | null>;
    getUserByUsername: (email: string) => Promise<User | null>;
    getUserRefreshTokenHash: (id: string) => Promise<User | null>;
    comparePassword: (storedPasswordHash: string, providedPassword: string) => Promise<boolean>;
    createAccount: (id: string, email: string, passwordHash: string) => Promise<string>;
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

    async getUserByUsername(username: string): Promise<User | null> {
        try {
            return await this.dbAccessor.getUserByUsername(username);
        } catch (err) {
            throw new Error(`Error fetching user by email with error ${err}`);
        }
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            return await this.dbAccessor.getUserById(id);
        } catch (err) {
            throw new Error(`Error fetching user by id with error ${err}`);
        }
    }

    async getRefreshTokenHash(id: string): Promise<string | null> {
        try {
            return await this.dbAccessor.getUserRefreshTokenHash(id);
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

    async createAccount(email: string, username: string | null, passwordHash: string): Promise<string> {
        try {
            return await this.dbAccessor.insertUser(email, username, passwordHash);
        } catch (err) {
            throw new Error('Error creating user');
        }
    }

    async updateUserPasswordHash(id: string, passwordHash: string): Promise<void> {
        try {
            await this.dbAccessor.updateUserPasswordHash(id, passwordHash);
        } catch (err) {
            throw new Error('Error updating user password hash');
        }
    }

    async updateUserRefreshTokenHash(id: string, refreshTokenHash: string): Promise<void> {
        try {
            await this.dbAccessor.updateUserRefreshTokenHash(id, refreshTokenHash);
        } catch (err) {
            throw new Error(`Error updating user refresh token ${err}`);
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