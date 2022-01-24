import express from 'express';
import {needAdmin} from "../helpers/auth.js";
import {checkRequiredPOST} from "../helpers/middlewares.js";
import TMDB from "../helpers/tmdb.js";
import {sendError} from "../helpers/utils.js";
import TorrentSearchApi from "torrent-search-api";
import DriveHelper from "../helpers/drive.js";
import OpenSubtitles from "../helpers/open-subtitles.js";
import WebTorrent from "webtorrent";

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

const client = new WebTorrent();
let streamingFile = null;

router.get('/movie/test', async (req, res) => {
    try {
        res.header('Accept-Ranges', 'bytes');
        res.header('Content-Disposition', 'attachment');
        res.header('Content-Type', 'video/mp4');

        const magnet = 'magnet:?xt=urn:btih:B550A0A32B0749ABFADB8EB0736F03D271E876E0&dn=Iron%20man%202%20(2010)%201080p%20BrRip%20x264%20-%201.60GB%20-%20YIFY&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce';

        let fileSize = 0, filename = '', filePath = null, torrentPath = null;

        if (!streamingFile) {
            streamingFile = await new Promise(resolve => {
                client.add(magnet, torrent => {
                    torrentPath = torrent.path;
                    let selected = torrent.files[0];
                    torrent.files.forEach(file => {
                        if (file.length > selected.length)
                            selected = file;
                    });

                    fileSize = selected.length;
                    filename = selected.name;
                    filePath = selected.path;

                    resolve(selected);
                });
            });
        }

        let start, range, end, parts, partialStart, partialEnd, chunkSize, total = streamingFile.length;

        if (req.headers.range) {
            range = req.headers.range;
            parts = range.replace(/bytes=/, "").split("-");
            partialStart = parts[0];
            partialEnd = parts[1];
            start = parseInt(partialStart, 10);
            end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
            chunkSize = (end - start) + 1;
            res.status(206);
        } else {
            start = 0;
            end = total;
            res.status(200);
        }

        console.log(start, end, total);

        res.header('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
        res.header('Content-Length', chunkSize);
        res.header('Transfer-Encoding', 'chunked');

        const stream = streamingFile.createReadStream({ start, end });

        await DriveHelper.streamMP4(stream, res);
        // stream.pipe(res);
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
