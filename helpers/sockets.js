import Folders from "../models/folders.js";
import DriveHelper from "./drive.js";

export default {
    createSockets(io) {
        let sockets = io.of('/upload');
        sockets.on('connection', (socket) => {

            socket.on('upload_url', async media => {
                const parent = await Folders.find({ _id: media.parent_id });
                if (!parent)
                    sockets.emit('error', 'parent does not exist');

                if (media.link.startsWith('magnet')) {
                    DriveHelper.uploadFromTorrent({
                        url: media.link,
                        outputName: media.name,
                        parentId: media.parent_id,
                        tmdbId: media.tmdbId,
                        convert: media.convert
                    }, ({ progress, speed }) => {
                        sockets.emit('progress', {progress, speed, link: media.link, name: media.name});
                    }).then(() => {
                        sockets.emit('finish', media.link);
                    }).catch(err => {
                        console.error(err);
                        sockets.emit('error', {err, link: media.link, name: media.name});
                    });
                } else {
                    DriveHelper.uploadFromUrl({
                        url: media.link,
                        outputName: media.name,
                        parentId: media.parent_id,
                        tmdbId: media.tmdbId,
                        convert: media.convert
                    }, progress => {
                        sockets.emit('progress', {progress, link: media.link, name: media.name});
                    }).then(() => {
                        sockets.emit('finish', media.link);
                    }).catch(err => {
                        console.error(err);
                        sockets.emit('error', {err, link: media.link, name: media.name});
                    });
                }
            });

        });
    }
}
