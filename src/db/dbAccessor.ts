/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { type Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface User {
    id: string;
    email: string;
    username: string | null;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}
export interface IDBAccessor {
    getUserByEmailOrUsername: (email: string) => Promise<User | null>;
    getUserByEmail: (email: string) => Promise<User | null>;
    getUserByUsername: (email: string) => Promise<User | null>;
    insertUser: (email: string, username: string | null, passwordHash: string) => Promise<string>;
    deleteUserById: (id: string) => Promise<void>
}

export class DBAccessor {
    private readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool
    }

    deconstructor(): void {
        void this.pool.end();
    }

    async getUserByEmailOrUsername(identifier: string): Promise<User | null> {
        try {
            const result = await this.pool.query(
                'SELECT * FROM users WHERE email = $1 OR username = $1',
                [identifier]
            );
            return result.rows[0] as User | null;
        } catch (err) {
            throw new Error(`Error getting user: ${err}`);
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const result = await this.pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            return result.rows[0] as User | null;
        } catch (err) {
            throw new Error(`Error getting user: ${err}`);
        }
    }

    async getUserByUsername(username: string): Promise<User | null> {
        try {
            const result = await this.pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            return result.rows[0] as User | null;
        } catch (err) {
            throw new Error(`Error getting user: ${err}`);
        }
    }

    async insertUser(email: string, username: string | null, passwordHash: string): Promise<string> {
        try {
            const result = await this.pool.query(
                `INSERT INTO users (id, email, username, password_hash, created_at, updated_at) VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW())
                RETURNING id`,
                [email, username, passwordHash]
            );
            return result.rows[0].id;
        } catch (err) {
            throw new Error(`Error inserting user ${err}`);
        }
    }

    async deleteUserById(id: string): Promise<void> {
        try {
            await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
        } catch (err) {
            throw new Error(`Error deleting user ${err}`);
        }
    }

    private async checkConnection(): Promise<void> {
        try {
            await this.pool.query('SELECT 1');
            console.log('Database connection established successfully');
        } catch (error) {
            console.error('Failed to establish database connection:', error);
            throw new Error('Failed to establish database connection');
        }
    }

}
