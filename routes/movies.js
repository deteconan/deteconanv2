import express from 'express';
import {needAdmin} from "../helpers/auth.js";
import {checkRequiredPOST} from "../helpers/middlewares.js";
import TMDB from "../helpers/tmdb.js";
import {sendError} from "../helpers/utils.js";
import TorrentSearchApi from "torrent-search-api";
import DriveHelper from "../helpers/drive.js";

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

router.get('/movies/genres', async (req, res) => {
    try {
        const genres = await TMDB.getMovieGenres();
        res.json(genres);
    } catch (err) {
        sendError(err, req, res);
    }
});

export default router;
