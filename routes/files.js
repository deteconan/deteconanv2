import express from 'express';
import DriveHelper from "../helpers/drive.js";
import {checkRequiredPOST} from "../helpers/middlewares.js";
import {sendError} from "../helpers/utils.js";
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
          m.backdrop = m.appProperties.backdrop;
          m.release_date = m.appProperties.release_date;
          m.parentId = m.appProperties.parentId;
          m.tmdbId = m.appProperties.tmdbId;
          m.imdbId = m.appProperties.imdbId;
          m.genre_ids = (m.appProperties.genre_ids || '').split(',').map(id => +id);
          m.rating = +m.appProperties.rating;
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

router.get('/usage/total', async (req, res) => {
    try {
        const total = await DriveHelper.getTotalUsage();
        res.json(total);
    } catch (err) {
        sendError(err, req, res);
    }
});

export default router;
