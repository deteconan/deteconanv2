import Folders from "../models/folders.js";
import DriveHelper from "./drive.js";

export default {
    createSockets(io) {
        let sockets = io.of('/upload');
        sockets.on('connection', (socket) => {

            socket.on('upload_url', async (media) => {
                const parent = await Folders.find({ _id: media.parent_id });
                if (!parent)
                    sockets.emit('error', 'parent does not exist');

                if (media.link.startsWith('magnet')) {
                    DriveHelper.uploadFromTorrent({
                        outputName: media.name,
                        url: media.link,
                        parentId: media.parent_id,
                        image: media.image,
                        releaseDate: media.release_date,
                        tmdbId: media.tmdbId,
                        genreIds: media.genre_ids,
                        convert: media.convert
                    }, ({ progress, speed }) => {
                        sockets.emit('progress', {progress, speed, link: media.link, name: media.name});
                    }).then(() => {
                        sockets.emit('finish', media.link);
                    }).catch(err => {
                        sockets.emit('error', {err, link: media.link, name: media.name});
                    });
                } else {
                    DriveHelper.uploadFromUrl(media.name, media.link, media.parent_id, media.image, media.release_date, progress => {
                        sockets.emit('progress', {progress, link: media.link, name: media.name});
                    }).then(() => {
                        sockets.emit('finish', media.link);
                    }).catch(err => {
                        sockets.emit('error', {err, link: media.link, name: media.name});
                    });
                }
            });

        });
    }
}
