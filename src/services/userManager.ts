// UserManager.ts
import bcrypt from 'bcrypt';
import { type DBAccessor, type User } from '../../db/dbAccessor';

export class UserManager {
    private readonly dbAccessor: DBAccessor;

    constructor(dbAccessor: DBAccessor) {
        this.dbAccessor = dbAccessor;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            return await this.dbAccessor.getUserByEmail(email);
        } catch (err) {
            throw new Error('Error fetching user by email');
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