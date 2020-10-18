import googleapis from 'googleapis';
const { google } = googleapis;
import axios from 'axios';
import credentials from '../credentials/admin.json';
import Folder from '../models/folders.js';
import config from '../credentials/config.json';

const jwToken = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/drive'],
    null
);

const drive = google.drive({
    version: 'v3',
    auth: jwToken
});

export default class DriveHelper {

    static async grantUserPermission(fileId, email) {
        const res = await drive.permissions.create({
            resource: {
                type: 'user',
                role: 'writer',
                emailAddress: email
            },
            fileId: fileId
        });

        return res.data;
    }

    static async getQuota() {
        const res = await drive.about.get({
            fields: 'storageQuota'
        });

        return res.data.storageQuota;
    }

    static async uploadFromUrl(outputName, url, parentId, onProgress) {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const quota = await this.getQuota();
        console.log('file size: ' + response.data.headers['content-length']);
        console.log('quota remaining: ' + ( Number(quota.limit) - (Number(quota.usage) + Number(response.data.headers['content-length'])) ));

        let metadata = {
            name: outputName,
            parents: [config.fileId],
            appProperties: {
                parentId
            }
        };

        let media = {
            mimeType: response.data.headers['content-type'],
            body: response.data
        };

        let time = new Date().getTime();
        const res = await drive.files.create({
            auth: jwToken,
            resource: metadata,
            media: media,
            fields: 'id'
        }, {
            onUploadProgress: e => {
                // process.stdout.clearLine();
                // process.stdout.cursorTo(0);
                let progress = Math.round(Number(e.bytesRead.toString()) * 10000 / Number(response.data.headers['content-length'])) / 100;
                // process.stdout.write(JSON.stringify(progress) + '%');

                if (onProgress) {
                    let now = new Date().getTime();

                    if (now - time >= 2000) {
                        onProgress(progress);
                        time = now;
                    }
                }
            }
        });

        // process.stdout.clearLine();

        return res.data;
    }

    static async listFiles(folderId, parentId = null) {
        let pageToken = null;
        let query = `'${folderId}' in parents and trashed=false`;

        if (parentId)
            query += ` and appProperties has { key='parentId' and value='${parentId}' }`;

        const params = folderId ? {
            auth: jwToken,
            pageSize: 1000,
            q: query,
            fields: 'nextPageToken, files(mimeType, id, name, thumbnailLink, createdTime, quotaBytesUsed, owners, appProperties)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            pageToken: pageToken
        } : {};

        let files = [];

        do {
            const res = await drive.files.list(params);
            pageToken = res.data.nextPageToken;
            files = files.concat(res.data.files);
        } while (!!pageToken);

        for (let file of files) {
            const owners = file.owners;

            if (owners && owners.length > 0) {
                file.owner = owners[0];
                delete file.owners;
            }
        }

        return files;
    }

    static async updateFile(fileId, params) {
        if (!params)
            return;

        const res = await drive.files.update({
            fileId: fileId,
            resource: {
                name: params.name,
                description: params.description
            }
        });

        return res.data;
    }

    static async deleteFile(fileId) {
        const res = await drive.files.delete({
            fileId: fileId
        });

        return res.data;
    }

    static async createFolder(name, parentId) {
        const folder = new Folder({
            name: name,
            parent_id: parentId
        });
        await folder.save();
    }

    static async buildTree() {
        const files = await this.listFiles(config.fileId);
        let folders = await Folder.find();

        folders = folders.map(f => {
            return {
                id: f._id.toString(),
                name: f.name,
                parent_id: f.parent_id,
                mimeType: 'folder'
            }
        });

        for (let folder of folders) {
            const fileChildren = files.filter(f => f.appProperties.parentId === folder.id);
            const folderChildren = folders.filter(f => f.parent_id === folder.id);
            folder.children = folderChildren.concat(fileChildren);
        }

        folders = folders.filter(f => !f.parent_id);

        return folders;
    }

};

