import express from 'express';
import DriveHelper from "../helpers/drive.js";
import {checkRequiredGET, checkRequiredPOST} from "../helpers/middlewares.js";
import {sendError} from "../helpers/utils.js";
import imdb from 'imdb-scrapper';
import TorrentSearchApi from 'torrent-search-api';
import Folder from '../models/folders.js';
import config from '../credentials/config.json';

TorrentSearchApi.enableProvider('Torrent9');
TorrentSearchApi.enableProvider('Torrentz2');
TorrentSearchApi.enableProvider('Limetorrents');
TorrentSearchApi.enableProvider('ThePirateBay');
TorrentSearchApi.enableProvider('KickassTorrents');
TorrentSearchApi.enableProvider('Rarbg');

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
          m.year = m.appProperties.year;
          m.parentId = m.appProperties.parentId;
          delete m.appProperties;
      });
      res.json(movies);
  } catch (err) {
      sendError(err, req, res);
  }
});

router.post('/files/delete', checkRequiredPOST('file_id'), async (req, res) => {
  try {
    await DriveHelper.deleteFile(req.body.file_id);
    res.json(HTTP_OK);
  } catch (err) {
    sendError(err, req, res);
  }
});

router.post('/movies/autocomplete', checkRequiredPOST('name'), async (req, res) => {
  try {
    let movies = await imdb.simpleSearch(req.body.name);

    if (!movies || !movies.d)
      return res.status(HTTP_BAD_REQUEST).send('No result');

    movies = movies.d.filter(m => m.i).map(m => {
      return {
        id: m.id,
        name: m.l,
        image: m.i.shift(),
        year: m.y
      }
    }).slice(0, 6);

    res.json(movies);
  } catch (err) {
    sendError(err, req, res);
  }
});

router.post('/movies/torrents', checkRequiredPOST('name'), async (req, res) => {
  try {
    let torrents = await TorrentSearchApi.search(req.body.name, null, 10);
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

export default router;
