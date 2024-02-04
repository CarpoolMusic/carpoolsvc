import dotenv from 'dotenv';
dotenv.config();

import AppleMusicService from '../../../src/services/appleMusicService';
import { Song } from '../../../src/services/schema/socketEventSchema';

const storefront = 'us';
const song: Song = {
    id: '1584281771',
    appleID: '',
    spotifyID: 'spotify123',
    title: 'TSU', 
    artist: 'Drake',
    uri: '',
    album: '',
    artworkUrl: '',
    votes: 0
};

describe('AppleMusicService', () => {
    let service: AppleMusicService;

    beforeEach(() => {
        service = new AppleMusicService();
    });

    it('should resolve song from Apple Music', async () => {
        const id = await service.resolveFromAppleMusic(song, storefront);
        expect(id).toBe(song.id);
    });

    it ('should throw when searching for non existent song', async () => {
        song.title = 'ThisSongDoesNotExist';
        await expect(service.resolveFromAppleMusic(song, storefront)).rejects.toThrow();
    });

    it('should throw an error when Apple Music API responds with non-200 status', async () => {
        await expect(service.resolveFromAppleMusic(song, 'ThisStorefrontDoesNotExist')).rejects.toThrow();
    });

    afterEach(() => {
        // Clean up any resources here
    });
});