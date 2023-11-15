/**
 * Session
 * Represents a single session, holding data pertinent to that session such as the host ID, session ID, Users, and queue.
 */

import { v4 as uuidv4 } from 'uuid';
import { User } from '../schema/socketEventSchema';

interface Song {
    songID: string;
    title: string;
    artist: string;
    addedBy: string;
    votes: number;
}

class Session {
    private hostSocketID: string;
    private sessionId: string;
    private sessionName: string;
    private users: Map<string, string>;
    private queue: Song[];

    constructor(host: User, sessionName: string) {
        this.hostSocketID = host.socketId;
        this.sessionId = uuidv4();
        this.sessionName = sessionName;
        this.users = new Map([[host.socketId, host.userId]]);
        this.queue = [];
    }

    public getSessionId(): string {
        return this.sessionId;
    }

    public join(User: User): void {
        if (this.users.has(User.socketId)) {
            throw new Error("User already exists");
        }
        this.users.set(User.socketId, User.userId);
    }

    public remove(socketId: string): void {
        this.users.delete(socketId);
    }

    public isUser(socketId: string): boolean {
        return this.users.has(socketId);
    }
    
    public getUsers() : User[] {
        return Array.from(this.users).map(([socketId, userId]) => ({ socketId, userId }));
    }

    public isHost(socketId: string): boolean {
        return this.hostSocketID === socketId;
    }

    public addSong(song: Song): void {
        this.queue.push(song);
    }

    public removeSong(songId: string): void {
        this.queue = this.queue.filter(song => song.songID !== songId);
    }

    public voteOnSong(songId: string, vote: number): void {
        const song = this.queue.find(song => song.songID === songId);
        if (song) {
            song.votes += vote;
        }
    }
}

export default Session; 