// Queue implementation to hold songs
import { type Song } from "../schema/socketEventSchema";

class Queue {
    private queue: Song[];

    constructor() {
        this.queue = [];
    }

    public enqueue(song: Song): void {
        this.queue.push(song);
    }

    public dequeue(): Song | undefined {
        return this.queue.shift();
    }

    public peek(): Song {
        return this.queue[0];
    }

    public peekTail(): Song {
        return this.queue[this.queue.length - 1];
    }

    public getQueue(): Song[] {
        return this.queue;
    }

    public getQueueLength(): number {
        return this.queue.length;
    }

    public getQueueIndex(songId: string): number {
        return this.queue.findIndex(song => song.id === songId);
    }

    public removeSong(songId: string): void {
        this.queue = this.queue.filter(song => song.id !== songId);
    }

    public voteOnSong(songId: string, vote: number): void {
        const song = this.queue.find(song => song.id === songId);
        if (song != null) {
            song.votes += vote;
        }
    }
}

export default Queue;
