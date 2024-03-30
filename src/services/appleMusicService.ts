import jwt from 'jsonwebtoken';
import fs from 'fs';

import { type Song } from './schema/socketEventSchema';

import dotenv from 'dotenv';
dotenv.config();


const TEAM_ID = (process.env.TEAM_ID ?? "");
const KEY_ID = (process.env.KEY_ID ?? "");
const PATH_TO_PRIV_KEY = (process.env.PATH_TO_APPLE_PRIV_KEY ?? "");

const BASE_URL = 'https://api.music.apple.com/v1';

class AppleMusicService {

    private readonly privateKey: string;
    private readonly token: string;
    private readonly lastTokenFetchSeconds: number | null = null;

    constructor() {
        this.privateKey = fs.readFileSync(PATH_TO_PRIV_KEY, 'utf8');
        this.token = this.generateToken();
    }

    private generateToken(): string {
        if (this.lastTokenFetchSeconds != null) {
            // check if token was fetched in last 180 days
            const secondsSinceLastFetch = (Date.now() - this.lastTokenFetchSeconds) / (1000 * 60 * 60 * 24);
            if (secondsSinceLastFetch < 180) {
                return this.token;
            }
        }
        const token = jwt.sign({}, this.privateKey, {
            algorithm: 'ES256',
            keyid: KEY_ID,
            expiresIn: '180d',
            issuer: TEAM_ID,
            header: {
                alg: 'ES256',
                kid: KEY_ID,
            },
        });

        return token;
    }

    private buildQuery(song: Song): string {
        if (song.title === "") {
            throw new Error('Song must have a title');
        }

        const queryParts = [
            song.title,
            (song.artist !== "") ? song.artist : '',
            (song.album !== "") ? song.album : '',
        ];

        const query = queryParts.join(' ');
        return encodeURIComponent(query);
    }

    public async resolveFromAppleMusic(song: Song, storefront: string): Promise<string> {
        const searchUrl = `${BASE_URL}/catalog/${storefront}/search`;
        const query = this.buildQuery(song);
        const url = `${searchUrl}?term=${query}&types=songs&limit=1`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Apple Music API responded with ${response.status}`);
            }

            const data = await response.json();
            console.log('response:', data);

            // Assuming the first result is the desired one
            // You might want to add more robust logic to ensure the correct song is selected
            const appleMusicId = data.results.songs.data[0].id;

            return appleMusicId;

        } catch (error) {
            console.error('Error resolving song from Apple Music:', error);
            throw error; // or handle it as per your application's error handling policy
        }
    }
}

export default AppleMusicService;
