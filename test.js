import IamHelper from "./helpers/iam.js";
import DriveHelper from "./helpers/drive.js";
// import "./helpers/mongodb.js";

import credentials from "./credentials/admin.json";
import config from './credentials/config.json';
import './helpers/mongodb.js';

import DB from "./helpers/DB.js";

async function test() {
    // await DriveHelper.uploadFromUrl('hp3.mp4', 'https://s0.vudeo.net/2vp3tsxvy4vjdohilmhbrougrq6d4i3wyy6lcjm5vjirxcrsg3qwd7zsvxcq/v.mp4', config.fileId);
    // await DriveHelper.deleteFile('14C065B_5Nl8mz9H7aeKfz6_9xxlcbcNX');
    // const res = await IamHelper.createServiceAccount(config.projectId);

    DB.init();
    await DriveHelper.uploadFromUrl('james', 'https://www.w3schools.com/html/mov_bbb.mp4', config.fileId, '5f8a7de9984b01115007d89e');
    // const files = await DriveHelper.listFiles(config.fileId);
    // console.log(files);
    // await DriveHelper.createFolder('Navets', '5f8a78a89a206e33c0450a58');

    DB.close();
}

test();
