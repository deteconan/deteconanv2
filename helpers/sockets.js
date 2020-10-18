import Folders from "../models/folders.js";
import DriveHelper from "./drive.js";

export default {
    createSockets(io) {
        let sockets = io.of('/upload');
        sockets.on('connection', (socket) => {

            socket.on('upload_url', async ({ url, parent_id }) => {
                const parent = await Folders.find({ _id: parent_id });
                if (!parent)
                    sockets.emit('error', 'parent does not exist');

                await DriveHelper.uploadFromUrl(url.name, url.link, parent_id, progress => {
                    sockets.emit('progress', {progress, link: url.link, name: url.name});
                }).then(() => {
                    sockets.emit('finish', url.link);
                }).catch(err => {
                    sockets.emit('error', {err, link: url.link, name: url.name});
                });
            });

        });
    }
}
