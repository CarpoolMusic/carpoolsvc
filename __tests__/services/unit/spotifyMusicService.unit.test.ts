import fetchMock, { mock } from 'fetch-mock';
import SpotifyMusicService from '/Users/nolb/dev/proj/carpoolsvc/src/services/spotifyMusicService';
import { Song } from '/Users/nolb/dev/proj/carpoolsvc/src/services/schema/socketEventSchema';
import { mockSpotifyGetToken, mockSpotifySearch200 } from '../mocks/spotifyMocks';

const song: Song = {
    id: '',
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    spotifyID: 'spotify123',
    appleID: '',
    uri: '',
    artworkUrl: '',
    votes: 0,
};
const market = 'US';

const BASE_URL = 'https://api.spotify.com/v1';
const QUERY = encodeURIComponent(`${song.title} track:${song.title} artist:${song.artist} album:${song.album}`);
const SEARCH_URL = `${BASE_URL}/search`;
const url = `${SEARCH_URL}?q=${QUERY}&type=track&market=${market}&limit=1`;

let service: SpotifyMusicService;

export const mockSpotifySearch500 = (): void => {
    fetchMock.get(url, 500);
}

describe('SpotifyMusicService', () => {


    beforeEach(() => {
        fetchMock.restore(); // Reset fetchMock for each test
        mockSpotifyGetToken();
        service = new SpotifyMusicService();
    });

    it('successfully resolves a Spotify song ID', async () => {
        mockSpotifySearch200();

        const resolvedId = await service.resolveFromSpotify(song, market);
        expect(resolvedId).toBe(song.spotifyID);
    });

    it('should throw an error when Spotify Music API responds with non-200 status', async () => {
        mockSpotifySearch500();

        await expect(service.resolveFromSpotify(song, market)).rejects.toThrow();
    });

    afterEach(() => {
        fetchMock.restore(); // Ensure we clean up after each test
    });
});