import SpotifyMusicService from '/Users/nolb/dev/proj/carpoolsvc/src/services/spotifyMusicService';
import { Song } from '/Users/nolb/dev/proj/carpoolsvc/src/services/schema/socketEventSchema';

const song: Song = {
    id: '',
    title: 'TSU',
    artist: 'Drake',
    album: '',
    spotifyID: '4s7QLoImIwmPi9L6dq1nVW',
    appleID: 'appleId',
    uri: '',
    artworkUrl: '',
    votes: 0,
};
const market = 'US';

let service: SpotifyMusicService;

describe('SpotifyMusicService', () => {
    beforeEach(async () => {
        service = new SpotifyMusicService();
    });

    it('successfully resolves token', async () => {
        const token = await service.requestToken();
        expect(token).toBeDefined();
    });

    it('successfully resolves a Spotify song ID', async () => {
        await service.init();
        const resolvedId = await service.resolveFromSpotify(song, market);
        expect(resolvedId).toBeDefined();
        expect(resolvedId).toBe(song.spotifyID);
    });

    it ('should throw when searching for non existent song', async () => {
        await service.init();
        song.title = 'ThisSongDoesNotExist';
        await expect(service.resolveFromSpotify(song, market)).rejects.toThrow();
        });

    it('should throw an error when Spotify API responds with non-200 status', async () => {
        await service.init();
        await expect(service.resolveFromSpotify(song, 'ThisMarketDoesNotExist')).rejects.toThrow();
    });

    it('should throw when we forget to initialize the service', async () => {
        await expect(service.resolveFromSpotify(song, market)).rejects.toThrow();
    });

    afterEach(() => {
        // Clean up any resources used during the test
    });
});