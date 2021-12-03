import axios from 'axios';
import ytdl from "ytdl-core";
import youtube from '@yimura/scraper'
import cheerio from "cheerio";

const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: {
        api_key: '6e919d0d4f2a31ef42c905a359ff004a'
    }
});

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
                return res.data.results.map(m => ({
                    id: m.id,
                    name: m.title,
                    image: m.poster_path,
                    release_date: m.release_date,
                    genre_ids: m.genre_ids
                }));
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
                id: movie.id,
                imdbId: movie.imdb_id,
                name: movie.title,
                original_title: movie.original_title,
                en_title: enTitle,
                description: movie.overview,
                image: movie.poster_path,
                rating: movie.vote_average,
                runtime: movie.runtime,
                cast: credits.cast,
                directors: credits.directors,
                writers: credits.writers,
                genre_ids: movie.genres.map(g => g.id),
                release_date: movie.release_date
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

        return `https://vid.puffyan.us${$('video > source').attr('src')}`;
    }

    static async getMovieTrailer(tmdbId, hd = true) {
        const movie = await this.getMovie(tmdbId);
        const yt = new youtube.default('fr-FR');

        const results = await yt.search(`${movie.original_title} bande annonce`, {
            language: 'fr-FR',
            searchType: 'video'
        });
        const trailer = results.videos.shift();

        return trailer ? this.getYoutubeProxyUrl(trailer.id) : null;
    }

    // static getMovieTrailer(tmdbId, hd = true) {
    //     return api.get(`/movie/${tmdbId}/videos`, {
    //         params: {
    //             language: 'fr-FR'
    //         }
    //     })
    //         .then(async res => {
    //             let trailer;
    //             for (const video of res.data.results.filter(r => r.site.toLowerCase() === 'youtube')) {
    //                 try {
    //                     trailer = video;
    //                     const youtubeId = trailer.key;
    //
    //                     if (youtubeId) {
    //                         await ytdl.getInfo(youtubeId);
    //                     }
    //
    //                     break;
    //                 } catch {}
    //             }
    //
    //             return trailer ? this.getYoutubeProxyUrl(trailer.key) : null;
    //         })
    //         .catch(err => console.error(err));
    // }

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

            return {
                id: movie.id,
                name: movie.title,
                image: movie.poster_path,
                release_date: movie.release_date
            };
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

            return movies.map(m => ({
                tmdbId: m.id,
                name: m.title,
                image: m.poster_path,
                release_date: m.release_date,
                genre_ids: m.genre_ids,
                rating: m.vote_average
            }));
        });

        const moviesPage2 = await api.get('/movie/upcoming', {
            params: {
                language: 'fr-FR',
                page: 2
            }
        }).then(res => {
            const movies = res.data.results;

            return movies.map(m => ({
                tmdbId: m.id,
                name: m.title,
                image: m.poster_path,
                release_date: m.release_date,
                genre_ids: m.genre_ids,
                rating: m.vote_average
            }));
        });

        return moviesPage1.concat(moviesPage2);
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
