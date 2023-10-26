/**
 * SessionManager
 * Singelton class that manages all sessions.
 * Manages the lifecycle of sessions, including creation, retrieval, and deletion of sessions.
 * This is managed in memory for now, but could be extended to use a database in the future.
 */
import Session from '../models/session';

class SessionManager {
    private static instance: SessionManager;
    private sessions: Map<string, Session>;

    private constructor() {
        this.sessions = new Map<string, Session>();
    }

    public static getInstance(): SessionManager {
        if (!this.instance) {
            this.instance = new SessionManager();
        }
        return this.instance;
    }

    public createSession(userId: string): string {
        const session = new Session(userId);
        this.sessions.set(session.sessionId, session);
        return session.sessionId;
    }

    public getSession(sessionId: string): Session | undefined {
        return this.sessions.get(sessionId);
    }

    public deleteSession(sessionId: string): void {
        this.sessions.delete(sessionId);
    }
}

export const sessionManager = SessionManager.getInstance();