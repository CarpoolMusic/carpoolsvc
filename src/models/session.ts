/**
 * Session
 * Represents a single session, holding data pertinent to that session such as the host ID, session ID, Users, and queue.
 */

import { makePaymentTxnWithSuggestedParams } from 'algosdk';
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
    private Users: Map<string, string>;
    private queue: Song[];

    constructor(host: User) {
        this.hostSocketID = host.socketId;
        this.sessionId = uuidv4();
        this.Users = new Map([[host.socketId, host.userId]]);
        this.queue = [];
    }

    public getSessionId(): string {
        return this.sessionId;
    }

    public join(User: User): void {
        if (this.Users.has(User.socketId)) {
            throw new Error("User already exists");
        }
        this.Users.set(User.socketId, User.userId);
    }

    public remove(socketId: string): void {
        this.Users.delete(socketId);
    }

    public isUser(socketId: string): boolean {
        return this.Users.has(socketId);
    }
    
    public getUsers() : User[] {
        return Array.from(this.Users).map(([socketId, userId]) => ({ socketId, userId }));
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