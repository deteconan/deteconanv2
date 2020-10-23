import IamHelper from "./helpers/iam.js";
import DriveHelper from "./helpers/drive.js";
// import "./helpers/mongodb.js";

import credentials from "./credentials/admin.json";
import config from './credentials/config.json';
import './helpers/mongodb.js';
import Credentials from './models/credentials.js';
import TorrentSearchApi from 'torrent-search-api';

import googleapis from 'googleapis';
const { google } = googleapis;

import DB from "./helpers/DB.js";
import {uploadImage} from "./helpers/utils.js";

async function test() {
    // await DriveHelper.uploadFromUrl('hp3.mp4', 'https://s0.vudeo.net/2vp3tsxvy4vjdohilmhbrougrq6d4i3wyy6lcjm5vjirxcrsg3qwd7zsvxcq/v.mp4', config.fileId);
    // await DriveHelper.deleteFile('14C065B_5Nl8mz9H7aeKfz6_9xxlcbcNX');
    // const res = await IamHelper.createServiceAccount(config.projectId);

    DB.init();
    /*await DriveHelper.uploadFromTorrent('speed', url, config.fileId, progress => {
        console.log(progress);
    });*/
    const quota = await DriveHelper.getQuota();
    console.log(parseInt(quota.limit) - parseInt(quota.usage));
    // const files = await DriveHelper.listFiles(config.fileId);
    // console.log(files);
    // await DriveHelper.createFolder('Navets', '5f8a78a89a206e33c0450a58');
    // await DriveHelper.uploadFromUrl('test', 'https://img.theculturetrip.com/768x432/wp-content/uploads/2015/12/56-3639490-1428514993312c2c5529f443b6b5fe7ffe0b4e4973.jpg', config.fileId);
    TorrentSearchApi.enableProvider('Torrent9');
    TorrentSearchApi.enableProvider('Torrentz2');
    TorrentSearchApi.enableProvider('Limetorrents');
    // TorrentSearchApi.enableProvider('1337x');
    TorrentSearchApi.enableProvider('ThePirateBay');
    TorrentSearchApi.enableProvider('KickassTorrents');
    TorrentSearchApi.enableProvider('Rarbg');
    // TorrentSearchApi.enableProvider('TorrentProject');
    // TorrentSearchApi.enableProvider('Yts');

    // let res = await TorrentSearchApi.search(`Nicky Larson Private Eyes`, null, 3);
    // res = res.filter(r => r.title !== 'No results returned'); // The Pirate Bay returns an error object so need to remove it
    // const image = await uploadImage('https://m.media-amazon.com/images/M/MV5BMGZlNTY1ZWUtYTMzNC00ZjUyLWE0MjQtMTMxN2E3ODYxMWVmXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg');
    // console.log(image);

    DB.close();
}

test();
