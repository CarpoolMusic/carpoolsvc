import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface User {
    id: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export class DBAccessor {
    private readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        try {
            const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0] as User;
            return user;
        } catch (err) {
            throw new Error(`Error fetching user by email: ${err}`);
        }
    }

    async insertUser(email: string, passwordHash: string): Promise<string> {
        const id = uuidv4();
        try {
            const result = await this.pool.query(
                'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
                [id, email, passwordHash]
            );
            return result.rows[0].id;
        } catch (err) {
            throw new Error(`Error inserting user: ${err}`);
        }
    }

    async deleteUserById(id: string): Promise<void> {
        try {
            await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
        } catch (err) {
            throw new Error(`Error deleting user with id ${id}: ${err}`);
        }
    }
}