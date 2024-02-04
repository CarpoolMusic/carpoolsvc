import SpotifyMusicService from "../../../src/services/spotifyMusicService";
import AppleMusicService from "../../../src/services/appleMusicService";
import SongCache from "../../../src/models/songCache";
import SongResolver from "../../../src/services/songResolver";

describe('SongResolver', () => {
    let songResolver: SongResolver;

    beforeEach(() => {
        songResolver = new SongResolver();
    });

    it('resolves Apple Music ID using Spotify ID', async () => {
        const song = {
            id: '',
            title: 'TSU',
            artist: 'Drake',
            album: '',
            spotifyID: '4s7QLoImIwmPi9L6dq1nVW',
            appleID: '',
            uri: '',
            artworkUrl: '',
            votes: 0,
        };

        let expectedAppleID = '1584281771';
        let resolvedSong = await songResolver.resolveSong(song);
        expect(resolvedSong.appleID).toBeDefined();
        expect(resolvedSong.appleID).toBe(expectedAppleID);

    });

});