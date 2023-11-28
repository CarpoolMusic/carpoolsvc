import { SERVICE } from '../../src/models/services';
import { Song } from '../../src/schema/socketEventSchema';

class SongResolver {

    // Takes a song object and returns the ID for the users corresponding music service type (appleMusic, spotify, etc).

    async resolveSong(song: Song, serviceType: string) {
        switch(serviceType) {
            case SERVICE.apple:
                return await this.resolveFromAppleMusic(song);
            case SERVICE.spotify:
                return await this.resolveFromSpotify(song);
            default:
                throw new Error("Invalid service type");
        }
    }

    private async resolveFromAppleMusic(song: Song) {
        // Use spotify API to resolve song ID
        

    }

    private async resolveFromSpotify(song: Song) {
    }


}