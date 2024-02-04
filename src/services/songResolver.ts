import SpotifyMusicService from './spotifyMusicService';
import AppleMusicService from './appleMusicService';
import SongCache from '../models/songCache';
import { Song } from './schema/socketEventSchema';

class SongResolver {
    private spotifyMusicService: SpotifyMusicService;
    private appleMusicService: AppleMusicService;
    private songCache: SongCache;

    constructor() {
        this.appleMusicService = new AppleMusicService();
        this.spotifyMusicService = new SpotifyMusicService();
        this.songCache = new SongCache();
    }

    public async resolveSong(song: Song): Promise<Song> {
        let resolvedSong = song;

        // needs async for token retrieval
        this.spotifyMusicService.init();

        if (song.appleID && song.spotifyID) {
            throw new Error("Song cannot have both an appleID and a spotifyID");
        }
        if (!song.appleID && !song.spotifyID) {
            throw new Error("Song must have either an appleID or a spotifyID");
        }

        if (!song.appleID) {
            let appleID = this.songCache.get(song.spotifyID);
            if (!appleID) {
                appleID = await this.appleMusicService.resolveFromAppleMusic(song, 'us');
                resolvedSong.appleID = appleID;
                this.songCache.add(song.spotifyID, appleID);
            }
        } else if (!song.spotifyID) {
            let spotifyID = this.songCache.get(song.appleID);
            if (!spotifyID) {
                spotifyID = await this.spotifyMusicService.resolveFromSpotify(song, 'us');
                resolvedSong.spotifyID = spotifyID;
                this.songCache.add(song.appleID, spotifyID);
            }
        }

        return resolvedSong;
    }
}
export default SongResolver;