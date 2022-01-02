import axios from 'axios';
import youtube from '@yimura/scraper'
import cheerio from "cheerio";

const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: {
        api_key: '6e919d0d4f2a31ef42c905a359ff004a'
    }
});

export function parseTmdbMovie(tmdbMovie) {
    const movie =  {
        tmdbId: +tmdbMovie.id,
        name: tmdbMovie.title,
        image: tmdbMovie.poster_path,
        backdrop: tmdbMovie.backdrop_path,
        release_date: tmdbMovie.release_date,
        rating: tmdbMovie.vote_average
    };

    if (tmdbMovie.genre_ids)
        movie.genre_ids = tmdbMovie.genre_ids;
    else if (tmdbMovie.genres)
        movie.genre_ids = tmdbMovie.genres.map(g => g.id);

    return movie;
}

export default class TMDB {

    static searchMovie(query) {
        return api.get('/search/movie', {
            params: {
                query: query,
                language: 'fr-FR'
            }
        }).then(res => {
            if (!Array.isArray(res.data.results))
                return [];
            else
                return res.data.results.map(movie => parseTmdbMovie(movie));
        }).catch(err => console.error(err.response.data));
    }

    static getMovie(tmdbId) {
        return api.get(`/movie/${tmdbId}`, {
            params: {
                language: 'fr-FR'
            }
        }).then(async res => {
            const movie = res.data;
            const credits = await this.getMovieCredits(tmdbId);
            const enTitle = await this.getEnglishMovieTitle(tmdbId);

            return {
                ...parseTmdbMovie(movie),
                imdbId: movie.imdb_id,
                original_title: movie.original_title,
                en_title: enTitle,
                description: movie.overview,
                runtime: movie.runtime,
                cast: credits.cast,
                directors: credits.directors,
                writers: credits.writers
            };
        }).catch(err => console.error(err.response.data));
    }

    static async getYoutubeProxyUrl(youtubeId) {
        const html = await axios.get(`https://vid.puffyan.us/watch?v=${youtubeId}`, {
            headers: {
                "Origin": "vid.puffyan.us",
                "User-Agent": "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "Referer": "https://vid.puffyan.us",
                "Referrer-Policy": "same-origin"
            }
        })
        .then((res => res.data));

        const $ = cheerio.load(html);

        const source = $('video > source').attr('src');

        return source ? `https://vid.puffyan.us${source}` : null;
    }

    static async getMovieTrailer(tmdbId, hd = true) {
        const movie = await this.getMovie(tmdbId);
        const yt = new youtube.default('fr-FR');

        let results = await yt.search(`${movie.original_title} bande annonce`, {
            language: 'fr-FR',
            searchType: 'video'
        });

        if (!results.videos.length) {
            results = await yt.search(`${movie.original_title} trailer`, {
                language: 'fr-FR',
                searchType: 'video'
            });
        }

        let trailer;

        for (const video of results.videos) {
            trailer = await this.getYoutubeProxyUrl(video.id);

            if (trailer)
                return trailer;
        }

        return null;
    }

    static getMovieFromImdb(imdbID) {
        return api.get(`/find/${imdbID}`, {
            params: {
                language: 'fr-FR',
                external_source: 'imdb_id'
            }
        }).then(res => {
            if (!Array.isArray(res.data.movie_results))
                return null;

            const movie = res.data.movie_results.shift();

            if (!movie)
                return null;

            return parseTmdbMovie(movie);
        }).catch(err => console.error(err));
    }

    static getMovieCredits(tmdbId) {
        return api.get(`/movie/${tmdbId}/credits`, {
            params: {
                language: 'fr-FR'
            }
        }).then(res => {
            const credits = res.data;
            let cast, directors, writers;

            if (credits.cast) {
                cast = credits.cast.map(c => ({
                    name: c.name,
                    role: c.character,
                    image: c.profile_path
                }));
            }

            if (credits.crew) {
                directors = credits.crew.filter(c => c.job === 'Director').map(c => ({
                    name: c.name,
                    job: c.department,
                    image: c.profile_path
                }));

                writers = credits.crew.filter(c => ['Screenstory', 'Screenplay'].includes(c.job)).map(c => ({
                    name: c.name,
                    job: c.department,
                    image: c.profile_path
                }));
            }

            return {
                cast,
                directors,
                writers
            };
        }).catch(err => console.error(err.response.data));
    }

    static async getUpcomingMovies() {
        const moviesPage1 = await api.get('/movie/upcoming', {
            params: {
                language: 'fr-FR',
                page: 1
            }
        }).then(res => {
            const movies = res.data.results;

            return movies.map(movie => parseTmdbMovie(movie));
        });

        const moviesPage2 = await api.get('/movie/upcoming', {
            params: {
                language: 'fr-FR',
                page: 2
            }
        }).then(res => {
            const movies = res.data.results;

            return movies.map(movie => parseTmdbMovie(movie));
        });

        return moviesPage1.concat(moviesPage2);
    }

    static getLatestMovie() {
        return api.get('/movie/now_playing')
            .then(res => {
                const movies = res.data.results;

                return parseTmdbMovie(movies[0]);
            });
    }

    static getEnglishMovieTitle(tmdbId) {
        return api.get(`/movie/${tmdbId}`, {
            params: {
                language: 'en-US'
            }
        })
        .then(res => {
            return res.data.title;
        }).catch(err => console.error(err.response.data));
    }

    static getMovieBackdrop(tmdbId) {
        // return api.get(`/movie/${tmdbId}/images`)
        //     .then(res => {
        //         const backdrops = res.data.backdrops;
        //
        //         if (Array.isArray(backdrops) && backdrops.length)
        //             return backdrops.pop().file_path;
        //         else
        //             return null;
        //     });

        return api.get(`/movie/${tmdbId}`, {
            params: {
                language: 'fr-FR'
            }
        })
        .then(res => {
            return res.data;
        });
    }

    static getSimilarMovies(tmdbId) {
        return api.get(`/movie/${tmdbId}/recommendations`)
            .then(res => {
                if (Array.isArray(res.data.results))
                    return res.data.results.map(m => parseTmdbMovie(m));
                else
                    return [];
            });
    }

    static getMovieGenres() {
        return api.get('/genre/movie/list', {
            params: {
                language: 'fr-FR'
            }
        }).then(res => {
            return res.data.genres;
        }).catch(err => console.error(err.response.data));
    }

}
