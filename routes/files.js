import express from 'express';
import DriveHelper from "../helpers/drive.js";
import {checkRequiredPOST} from "../helpers/middlewares.js";
import {sendError} from "../helpers/utils.js";

const router = express.Router();

router.get('/files/tree', async (req, res) => {
  try {
    const tree = await DriveHelper.buildTree();
    res.json(tree);
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

export default router;
