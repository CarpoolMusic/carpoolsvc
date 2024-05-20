/**
 * Session
 * Represents a single session, holding data pertinent to that session such as the host ID, session ID, Users, and queue.
 */

import { v4 as uuidv4 } from 'uuid';
import { type User, type Song } from '../schema/socketEventSchema';
import Queue from './queue';

class Session {
    private readonly hostSocketID: string;
    private readonly sessionId: string;
    private readonly sessionName: string;
    private readonly users: Map<string, string>;
    private readonly queue: Queue;

    constructor(host: User, sessionName: string) {
        this.hostSocketID = host.socketId;
        this.sessionId = uuidv4();
        this.sessionName = sessionName;
        this.users = new Map([[host.socketId, host.userId]]);
        this.queue = new Queue();
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

    public getUsers(): User[] {
        return Array.from(this.users).map(([socketId, userId]) => ({ socketId, userId }));
    }

    public isHost(socketId: string): boolean {
        return this.hostSocketID === socketId;
    }

    // Queue methods
    public addSong(song: Song): void {
        this.queue.enqueue(song);
    }

    public getNextSong(): Song | undefined {
        return this.queue.dequeue();
    }

    public viewNextSong(): Song {
        return this.queue.peek();
    }

    public viewLastSongAdded(): Song {
        return this.queue.peekTail();
    }

    public getNumVotes(songId: string): number {
        const song = this.findSong(songId)
        return (song != null) ? song.votes : 0;
    }

    public voteOnSong(songId: string, vote: number): void {
        this.queue.voteOnSong(songId, vote);
    }

    public removeSong(songId: string): void {
        this.queue.removeSong(songId);
    }

    public findSong(songId: string): Song | undefined {
        return this.queue.getQueue().find(song => song.id === songId);
    }

    public queueLength(): number {
        return this.queue.getQueueLength();
    }

}

export default Session; 