import express from 'express';
import {needAdmin} from "../helpers/auth.js";
import {checkRequiredPOST} from "../helpers/middlewares.js";
import TMDB from "../helpers/tmdb.js";
import {sendError} from "../helpers/utils.js";
import TorrentSearchApi from "torrent-search-api";
import DriveHelper from "../helpers/drive.js";
import OpenSubtitles from "../helpers/open-subtitles.js";

const router = express.Router();

router.post('/movies/autocomplete', needAdmin, checkRequiredPOST('name'), async (req, res) => {
    try {
        const movies = await TMDB.searchMovie(req.body.name);

        if (!movies)
            return res.status(HTTP_BAD_REQUEST).send('No result');

        res.json(movies.slice(0, 6));
    } catch (err) {
        sendError(err, req, res);
    }
});

router.post('/movies/torrents', needAdmin, checkRequiredPOST('name', 'providers'), async (req, res) => {
    try {
        await TorrentSearchApi.disableAllProviders();
        for (let provider of req.body.providers)
            await TorrentSearchApi.enableProvider(provider);
        let torrents = await TorrentSearchApi.search(req.body.name, null, 10);
        for (let torrent of torrents) {
            if (!torrent.magnet)
                torrent.magnet = await TorrentSearchApi.getMagnet(torrent);
        }
        torrents = torrents.filter(t => t.title !== 'No results returned' && t.magnet); // The Pirate Bay returns an error object so need to remove it
        torrents = torrents.map(t => {
            return {
                id: t.id,
                title: t.title,
                size: t.size,
                magnet: t.magnet,
                peers: t.peers,
                seeds: t.seeds,
                provider: t.provider,
                time: t.time
            }
        });

        res.json(torrents);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/movies/details/:tmdb_id', async (req, res) => {
    try {
        const movie = await TMDB.getMovie(req.params.tmdb_id);

        res.json(movie);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/movie/trailer/:tmdb_id', async (req, res) => {
    try {
        const hd = req.query.hd === 'true';
        const trailer = await TMDB.getMovieTrailer(req.params.tmdb_id, hd);

        res.json(trailer);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/movie/about/:tmdb_id', async (req, res) => {
    try {
        const movie = await TMDB.getMovie(req.params.tmdb_id);

        movie.similar = await TMDB.getSimilarMovies(req.params.tmdb_id);

        res.json(movie);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.post('/movies/update', needAdmin, checkRequiredPOST('id'), async (req, res) => {
    try {
        await DriveHelper.updateFile(req.body);
        res.sendStatus(HTTP_OK);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/movies/upcoming', async (req, res) => {
    try {
        const trends = await TMDB.getUpcomingMovies();
        res.json(trends);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/movie/backdrop/:tmdb_id', async (req, res) => {
    try {
        const backdrop = await TMDB.getMovieBackdrop(req.params.tmdb_id);
        res.json(backdrop);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/movies/genres', async (req, res) => {
    try {
        const genres = await TMDB.getMovieGenres();
        res.json(genres);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/movie/stream/:file_id', async (req, res) => {
    try {
        const headers = {
            'Content-Type': 'video/mp4'
        };

        if (req.header('Range')) {
            headers['Range'] = req.header('Range');
            headers['Accept-Ranges'] = 'bytes';
            headers['Content-Disposition'] = 'inline';
        }

        const stream = await DriveHelper.getFileStream(req.params.file_id, headers);

        if (req.header('Range')) {
            res.header('Content-Range', stream.headers['content-range']);
            res.header('Content-Length', stream.headers['content-length']);
            res.status(206);
        } else {
            res.header(`Content-Length`, stream.headers['content-length']);
            res.status(200);
        }

        res.header('Accept-Ranges', 'bytes');
        res.header('Content-Disposition', 'inline');
        res.header('Content-Type', 'video/mp4');

        stream.headers['accept-ranges'] = 'bytes';
        stream.headers['content-disposition'] = 'inline';
        stream.headers['content-type'] = 'video/mp4';

        res.type('media');

        stream.data.pipe(res);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/movie/subtitle/:imdb_id', async (req, res) => {
    try {
        const offset = req.query.offset || 0;
        const stream = await OpenSubtitles.getVTTSubtitles(req.params.imdb_id, +offset);

        if (stream)
            stream.pipe(res);
        else
            res.status(HTTP_NOT_FOUND).send('No subtitles found');
    } catch (err) {
        sendError(err, req, res);
    }
});

export default router;
