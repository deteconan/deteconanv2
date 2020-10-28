import express from 'express';
import '../helpers/auth.js';
import {needAuth} from "../helpers/auth.js";
import {sendError} from "../helpers/utils.js";
import DriveHelper from "../helpers/drive.js";
import config from "../credentials/config.json";

const router = express.Router();

router.get('/users/current-user', needAuth, async (req, res) => {
    try {
        res.json({
            email: req.user.email,
            admin: req.user.admin
        });
    } catch (err) {
        sendError(err, req, res);
    }
});

router.post('/users/grant-access', needAuth, async (req, res) => {
    try {
        await DriveHelper.grantUserReadPermission(config.fileId, req.user.email);
        res.sendStatus(HTTP_OK);
    } catch (err) {
        sendError(err, req, res);
    }
});

export default router;
