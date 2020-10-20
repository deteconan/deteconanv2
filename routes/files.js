import express from 'express';
import DriveHelper from "../helpers/drive.js";
import {checkRequiredPOST} from "../helpers/middlewares.js";

const router = express.Router();

router.get('/files/tree', async (req, res) => {
  const tree = await DriveHelper.buildTree();
  res.json(tree);
});

router.post('/files/delete', checkRequiredPOST('file_id'), async (req, res) => {
  await DriveHelper.deleteFile(req.body.file_id);
  res.json(HTTP_OK);
});

export default router;
