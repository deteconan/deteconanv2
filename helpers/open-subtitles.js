import OS from 'opensubtitles-api';
import TMDB from "./tmdb.js";
import srt2vtt from 'srt-to-vtt';
import axios from "axios";

const OpenSubtitlesInstance = new OS({
    useragent: 'TemporaryUserAgent',
    username: 'sunwize',
    password: '!my4P3Bs~Tfj;5;8',
    ssl: true
});

export default class OpenSubtitles {
    static login() {
        return OpenSubtitlesInstance.login()
            .then(res => res.token)
            .catch(err => console.error(err));
    }

    static async getVTTSubtitles(tmdbId) {
        if (!this.token)
            this.token = await this.login();

        const movie = await TMDB.getMovie(tmdbId);

        if (!movie) {
            console.error('Looking for subtitles: Movie not found');
            return Promise.resolve(null);
        }

        const url = await OpenSubtitlesInstance.search({
            sublanguageid: 'fre',
            imdbid: movie.imdbId
        })
        .then(subtitles => {
            if (!subtitles.fr)
                return null;

            return subtitles.fr.utf8;
        })
        .catch(err => {
            console.error(err.response.data);
            return null;
        });

        if (!url) {
            console.error('Looking for subtitles: Subtitles not found');
            return null;
        }

        const stream = await axios.get(url, {
            responseType: 'stream'
        });

        return stream.data.pipe(srt2vtt());
    }
}
