import express from 'express';
import DriveHelper from "../helpers/drive.js";
import {checkRequiredPOST} from "../helpers/middlewares.js";
import Folders from '../models/folders.js';

const router = express.Router();

router.get('/files/tree', async (req, res) => {
  const tree = await DriveHelper.buildTree();
  res.json(tree);
});

router.post('/files/upload/urls', checkRequiredPOST('urls'), async (req, res) => {
  const urls = req.body.urls;
  const parentId = req.body.parent_id;

  if (!Array.isArray(urls))
    return res.status(HTTP_BAD_REQUEST).send('urls must be an array');

  const parent = await Folders.find({ _id: parentId });
  if (!parent)
    return res.status(HTTP_BAD_REQUEST).send('parent does not exist');

  for (let url of urls) {
    await DriveHelper.uploadFromUrl(url.name, url.link, parentId, progress => {

    });
  }

  res.sendStatus(HTTP_OK);
});

export default router;
