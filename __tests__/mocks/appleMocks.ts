import fetchMock from 'fetch-mock';
import { Song } from '../../src/schema/socketEventSchema';

const storefront = 'us';
const song: Song = {
    id: '123',
    appleID: '123',
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
export const mockAppleSearch200 = (): void => {
    console.log('mocked url', url);
    fetchMock.get(url, {
        status: 200,
        body: {
            results: {
                songs: {
                    data: [{ id: song.appleID }]
                }
            }
        }
    });
}

export const mockAppleSearch500 = (): void => {
    fetchMock.get(url, 500);
}