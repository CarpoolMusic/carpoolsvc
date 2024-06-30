import { userManager } from '@services/userManager';
export class User {
    public readonly id: string;
    public readonly email: string;
    public readonly username: string | null;
    private _password_hash: string;
    private _refreshToken: string | null;
    public readonly created_at: Date;
    public updated_at: Date;

    constructor(
        id: string,
        email: string,
        username: string | null,
        password_hash: string,
        created_at: Date,
        updated_at: Date
    ) {
        this.id = id;
        this.email = email;
        this.username = username;
        this._password_hash = password_hash;
        this._refreshToken = null; // initially, no refresh token
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    public updatePasswordHash(password_hash: string): void {
        userManager.updateUserPasswordHash(this.email, password_hash);
    }

    public updateRefreshTokenHash(refreshTokenHash: string): void {
        userManager.updateUserRefreshTokenHash(this.email, refreshTokenHash);
    }

    public async getRefreshTokenHash(): Promise<string | null> {
        return userManager.getRefreshTokenHash(this.id);
    }

    // Getter for password hash
    public get password_hash(): string {
        return this._password_hash;
    }

    // Getter for refresh token
    public get refreshToken(): string | null {
        return this._refreshToken;
    }
}