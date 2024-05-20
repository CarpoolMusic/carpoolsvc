import fetchMock from 'fetch-mock';
import { Song } from '../../src/schema/socketEventSchema';

const song: Song = {
    id: '123',
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
export const mockSpotifySearch200 = (): void => {

    fetchMock.get(url, {
        body: {
            tracks: {
                items: [{ id: song.spotifyID }],
            },
        },
        headers: { 'Content-Type': 'application/json' }
    });
}

export const mockSpotifyGetToken = (): void => {
    fetchMock.post('https://accounts.spotify.com/api/token', {
        access_token: 'mockAccessToken',
        token_type: 'Bearer',
        expires_in: 3600,
    });
}