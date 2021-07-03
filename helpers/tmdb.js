import axios from 'axios';

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
                    release_date: m.release_date
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
                genres: movie.genres.map(g => g.name),
                release_date: movie.release_date
            };
        }).catch(err => console.error(err.response.data));
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

                writers = credits.crew.filter(c => c.job === 'Screenstory').map(c => ({
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

    static getMoviePosters(tmdbId) {
        return api.get(`/movie/${tmdbId}/images`, {
            params: {
                language: 'fr-FR',
                include_image_language: 'fr'
            }
        }).then(res => {
            console.log(res.data);
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
                release_date: m.release_date
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
                release_date: m.release_date
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

}
