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

    const url = 'magnet:?xt=urn:btih:PAZCZS6YDWD4KFSNNUHYQILEJM2BM2IZ&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://9.rarbg.me:2710/announce&tr=udp://9.rarbg.to:2740/announce&tr=udp://9.rarbg.com:2770/announce&tr=udp://explodie.org:6969/announce&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://ipv4.tracker.harry.lu:80/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=http://servandroidkino.ru/announce&tr=http://1337.abcvg.info/announce&tr=udp://open.stealth.si:80/announce&tr=http://tracker.bittor.pw:1337/announce&tr=http://tracker3.itzmx.com:8080/announce&tr=http://open.acgnxtracker.com/announce&tr=http://share.camoe.cn:8080/announce&tr=udp://bt.xxx-tracker.com:2710/announce&tr=udp://exodus.desync.com:6969/announce&tr=udp://open.demonii.si:1337/announce&tr=udp://tracker.torrent.eu.org:451/announce&tr=udp://tracker.cyberia.is:6969/announce&tr=udp://151.80.120.114:2710/announce&tr=http://91.217.91.21:3218/announce&tr=http://tracker2.itzmx.com:6961/announce&tr=udp://tracker.yoshi210.com:6969/announce&tr=http://tracker.yoshi210.com:6969/announce&tr=http://tracker.tvunderground.org.ru:3218/announce&tr=http://torrentsmd.com:8080/announce&tr=udp://amigacity.xyz:6969/announce&tr=udp://newtoncity.org:6969/announce&tr=udp://zephir.monocul.us:6969/announce&tr=udp://denis.stalker.upeer.me:6969/announce&tr=http://tracker.bt4g.com:2095/announce&tr=http://open.trackerlist.xyz:80/announce&tr=udp://opentor.org:2710/announce';
    DB.init();
    /*await DriveHelper.uploadFromTorrent('speed', url, config.fileId, progress => {
        console.log(progress);
    });*/
    const files = await DriveHelper.listFiles(config.fileId);
    console.log(files);
    // await DriveHelper.createFolder('Navets', '5f8a78a89a206e33c0450a58');

    DB.close();
}

test();
