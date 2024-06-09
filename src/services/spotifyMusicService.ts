import { type Song } from '../schema/socketEventSchema';

import dotenv from 'dotenv';
dotenv.config();

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const BASE_URL = 'https://api.spotify.com';
const SEARCH_URL = `${BASE_URL}/v1/search`;

const CLIENT_ID = '61c4e261fe3348b7baa6dbf27879f865';
const CLIENT_SECRET = 'a3ca5c8fea4248cba3a15a4bfd6bda48';

class SpotifyMusicService {
    private accessToken: string = '';
    private readonly lastTokenFetchSeconds: number | null = null;

    public async init(): Promise<void> {
        this.accessToken = await this.requestToken();
    }

    public async requestToken(): Promise<string> {
        if (this.lastTokenFetchSeconds) {
            const secondsSinceLastFetch = (Date.now() - this.lastTokenFetchSeconds) / 1000;
            if (secondsSinceLastFetch < 3600) {
                return this.accessToken;
            }
        }
        try {
            const response = await fetch(TOKEN_URL, {
                method: 'POST',
                body: new URLSearchParams({
                    'grant_type': 'client_credentials'
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to request token from Spotify API. Status: ${response.status}`);
            }

            const data = await response.json();
            const accessToken = await data.access_token;

            return accessToken;
        } catch (error) {
            console.error('Error requesting token from Spotify API:', error);
            throw error; // or handle it as per your application's error handling policy
        }
    }

    private buildQuery(song: Song): string {
        if (!song.title) {
            throw new Error('Song must have a title');
        }

        const queryParts = [
            `${song.title} track:${song.title}`,
            (song.artist) ? `artist:${song.artist}` : '',
            (song.album) ? `album:${song.album}` : '',
        ];

        const query = queryParts.filter(Boolean).join(' ');
        return encodeURIComponent(query);
    }


    public async resolveFromSpotify(song: Song, market: string): Promise<string> {
        const query = this.buildQuery(song);
        const url = `${SEARCH_URL}?q=${query}&type=track&market=${market}&limit=1`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Spotify API responded with ${response.status}`);
            }

            const data = await response.json();

            const spotifyId = data.tracks.items[0].id;

            return spotifyId;

        } catch (error) {
            console.error('Error resolving song from Spotify:', error);
            throw error;
        }
    }
}

export default SpotifyMusicService;