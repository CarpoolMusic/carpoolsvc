// Queue implementation to hold songs
import { Song } from "../schema/socketEventSchema";

class Queue {
    private queue: Song[];

    constructor() {
        this.queue = [];
    }

    enqueue(song: Song) {
        this.queue.push(song);
    }

    dequeue(): Song | undefined {
        return this.queue.shift();
    }

    peek(): Song {
        return this.queue[0];
    }

    peekTail(): Song {
        return this.queue[this.queue.length - 1];
    }

    getQueue(): Song[] {
        return this.queue;
    }

    getQueueLength(): number {
        return this.queue.length;
    }

    getQueueIndex(songId: string): number {
        return this.queue.findIndex(song => song.id === songId);
    }

    removeSong(songId: string): void {
        this.queue = this.queue.filter(song => song.id !== songId);
    }

    voteOnSong(songId: string, vote: number): void {
        const song = this.queue.find(song => song.id === songId);
        if (song) {
            song.votes += vote;
        }
    }
}

export default Queue;
