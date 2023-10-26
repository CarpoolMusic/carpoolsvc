/**
 * Session
 * Represents a single session, holding data pertinent to that session such as the host ID, session ID, members, and queue.
 */

import { v4 as uuidv4 } from 'uuid';

interface Song {
    songID: string;
    title: string;
    artist: string;
    addedBy: string;
    votes: number;
}

class Session {
    public hostId: string;
    public sessionId: string;
    public members: Set<string>;
    public queue: Song[];

    constructor(hostId: string) {
        this.hostId = hostId;
        this.sessionId = uuidv4();
        this.members = new Set([hostId]);
        this.queue = [];
    }

    public join(socketId: string): void {
        this.members.add(socketId);
    }

    public remove(socketId: string): void {
        this.members.delete(socketId);
    }

    public isMember(socketId: string): boolean {
        return this.members.has(socketId);
    }

    public isHost(socketId: string): boolean {
        return this.hostId === socketId;
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