import dotenv from 'dotenv';
dotenv.config();

import fetchMock, { mock } from 'fetch-mock'; // Import fetch-mock
import AppleMusicService from '../../../src/services/appleMusicService';
import { Song } from '../../../src/services/schema/socketEventSchema';
import { mockAppleSearch200, mockAppleSearch500 } from '../mocks/appleMocks';

const storefront = 'us';
const song: Song = {
    id: '123',
    appleID: '',
    spotifyID: 'spotify123',
    title: 'Test Song', 
    artist: 'Test Artist',
    uri: '',
    album: 'Test Album',
    artworkUrl: '',
    votes: 0
};
const BASE_URL = 'https://api.music.apple.com/v1';
const searchUrl = `${BASE_URL}/catalog/${storefront}/search`;
const query = encodeURIComponent(`${song.title} ${song.artist} ${song.album}`);
const url = `${searchUrl}?term=${query}&types=songs&limit=1`;

describe('AppleMusicService', () => {
    let service: AppleMusicService;

    beforeEach(() => {
        service = new AppleMusicService();
        fetchMock.restore(); // Ensure mocks are cleared before each test
    });

    it('should resolve song from Apple Music', async () => {
        // Mock the Apple Music API response with fetchMock

        mockAppleSearch200();
        const id = await service.resolveFromAppleMusic(song, storefront);
        expect(id).toBe(song.id);
    });

    it('should throw an error when Apple Music API responds with non-200 status', async () => {
        // Mock the Apple Music API response with fetchMock
        mockAppleSearch500();
        await expect(service.resolveFromAppleMusic(song, storefront)).rejects.toThrow();
    });

    afterEach(() => {
        fetchMock.restore(); // Clears any mocks to ensure clean state for next tests
    });
});