import express from 'express';
import DriveHelper from "../helpers/drive.js";
import {checkRequiredGET, checkRequiredPOST} from "../helpers/middlewares.js";
import {sendError} from "../helpers/utils.js";
import imdb from 'imdb-scrapper';
import TMDB from "../helpers/tmdb.js";
import TorrentSearchApi from 'torrent-search-api';
import Folder from '../models/folders.js';
import config from '../credentials/config.json';
import {needAdmin} from "../helpers/auth.js";

const router = express.Router();

router.get('/files/tree', async (req, res) => {
    try {
        const tree = await DriveHelper.buildTree();
        res.json(tree);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/folders', async (req, res) => {
    try {
        let folders = await Folder.find();
        folders = folders.map(f => {
            return {
                id: f._id,
                name: f.name
            }
        });
        res.json(folders);
    } catch (err) {
        sendError(err, req, res);
    }
});

router.get('/movies', async (req, res) => {
  try {
      let movies = await DriveHelper.listFiles(config.fileId, '5f8a78a89a206e33c0450a58'); // Movies folder
      movies.forEach(m => {
          m.image = m.appProperties.image;
          m.release_date = m.appProperties.release_date;
          m.parentId = m.appProperties.parentId;
          m.tmdbId = m.appProperties.tmdbId;
          delete m.appProperties;
      });
      res.json(movies);
  } catch (err) {
      sendError(err, req, res);
  }
});

router.post('/files/delete', needAdmin, checkRequiredPOST('file_id'), async (req, res) => {
    try {
        await DriveHelper.deleteFile(req.body.file_id);
        res.json(HTTP_OK);
    } catch (err) {
        sendError(err, req, res);
    }
});

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

router.get('/movies/details/:tmdb_id', checkRequiredGET('tmdb_id'), async (req, res) => {
    try {
        // const movie = await imdb.getFull(req.params.imdb_id);
        const movie = await TMDB.getMovie(req.params.tmdb_id);

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

router.get('/usage/total', async (req, res) => {
    try {
        const total = await DriveHelper.getTotalUsage();
        res.json(total);
    } catch (err) {
        sendError(err, req, res);
    }
});

export default router;
