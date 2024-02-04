/**
 * SessionManager
 * Singelton class that manages all sessions.
 * Manages the lifecycle of sessions, including creation, retrieval, and deletion of sessions.
 * This is managed in memory for now, but could be extended to use a database in the future.
 */
import Session from '../models/session';
import { User } from './schema/socketEventSchema';

class SessionManager {
    private sessions: Map<string, Session>;

    constructor() {
        this.sessions = new Map<string, Session>();
    }

    public createSession(host: User, sessionName: string): string {
        const session = new Session(host, sessionName);
        const sessionId = session.getSessionId();
        this.sessions.set(sessionId, session);
        return sessionId;
    }

    public getSession(sessionId: string): Session | undefined {
        return this.sessions.get(sessionId);
    }

    public joinSession(sessionId: string, User: User): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.join(User);
        } else {
            throw new Error('Invalid session ID ( join session )');
        }
    }

    public deleteSession(sessionId: string): void {
        this.sessions.delete(sessionId);
    }
}

export default SessionManager;