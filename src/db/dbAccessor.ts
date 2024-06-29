/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { type Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface User {
    id: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}
export interface IDBAccessor {
    getUserByEmail: (email: string) => Promise<User | null>;
    getUserByUsername: (username: string) => Promise<User | null>;
    insertUser: (email: string, passwordHash: string) => Promise<string>;
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

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0] as User;
            return user;
        } catch (err) {
            throw new Error(`Error getting user by email ${err}`);
        }
    }

    async getUserByUsername(username: string): Promise<User | null> {
        try {
            const result = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = result.rows[0] as User;
            return user;
        } catch (err) {
            throw new Error(`Error getting user by username ${err}`);
        }
    }

    async insertUser(email: string, passwordHash: string): Promise<string> {
        const id = uuidv4();
        try {
            await this.pool.query(
                'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
                [id, email, passwordHash]
            );
            return id;
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
