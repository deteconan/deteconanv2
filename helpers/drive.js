import googleapis from 'googleapis';
const { google } = googleapis;
import axios from 'axios';
import credentials from '../credentials/admin.json';
import Folder from '../models/folders.js';
import FileAccount from '../models/files_accounts.js';
import config from '../credentials/config.json';
import WebTorrent from 'webtorrent';
import mime from 'mime';
import Credentials from "../models/credentials.js";
import {uploadImage} from "./utils.js";

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

    static async updateQuota(accountEmail = null) {
        let accounts = [];

        if (accountEmail) {
            accounts = await Credentials.find({ client_email: accountEmail });
        } else {
            accounts = await Credentials.find();
        }

        for (let account of accounts) {
            const jwToken = new google.auth.JWT(
                account.client_email,
                null,
                account.private_key,
                ['https://www.googleapis.com/auth/drive'],
                null
            );

            const res = await drive.about.get({
                fields: 'storageQuota',
                auth: jwToken
            });

            const remaining = parseInt(res.data.storageQuota.limit) - parseInt(res.data.storageQuota.usage);
            await Credentials.updateOne({ client_email: account.client_email }, { $set: { remaining_quota: remaining } });
            console.log(account.client_email, '-> quota updated');
        }
    }

    static async uploadFromTorrent(outputName, url, parentId, image = null, year = null, onProgress) {
        let response = null;
        let client = new WebTorrent();
        let fileSize = 0, filename = '';

        await new Promise(resolve => {
            client.add(url, torrent => {
                let selected = torrent.files[0];
                torrent.files.forEach(file => {
                    if (file.length > selected.length)
                        selected = file;
                });

                fileSize = selected.length;
                filename = selected.name;

                response = selected.createReadStream();
                resolve();
            });
        });

        if (image) {
            console.log('Uploading image');
            image = await uploadImage(image);
            console.log('Image uploaded: ' + image);
        }

        let metadata = {
            name: outputName,
            parents: [config.fileId],
            appProperties: {
                parentId,
                image,
                year
            }
        };

        let media = {
            mimeType: mime.getType(filename),
            body: response
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
                let progress = Math.round(Number(e.bytesRead.toString()) * 10000 / Number(fileSize)) / 100;
                // process.stdout.write(JSON.stringify(progress) + '%');

                if (onProgress) {
                    let now = new Date().getTime();

                    if (now - time >= 2000) {
                        onProgress(progress);
                        time = now;
                    }
                }
            }
        }).catch(err => {
            console.error(err);
        });

        const fileAccount = new FileAccount({
            file_id: res.data.id,
            account_email: credentials.client_email
        });

        await fileAccount.save();
        await this.updateQuota(credentials.client_email);

        return res.data;
    }

    static async uploadFromUrl(outputName, url, parentId, image = null, year = null, onProgress) {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const quota = await this.getQuota();
        console.log('file size: ' + response.data.headers['content-length']);
        console.log('quota remaining: ' + ( Number(quota.limit) - (Number(quota.usage) + Number(response.data.headers['content-length'])) ));

        if (image) {
            console.log('Uploading image');
            image = await uploadImage(image);
            console.log('Image uploaded: ' + image);
        }

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
        }).catch(err => {
            console.error(err);
        });

        // process.stdout.clearLine();

        const fileAccount = new FileAccount({
            file_id: res.data.id,
            account_email: credentials.client_email
        });

        await fileAccount.save();
        await this.updateQuota(credentials.client_email);

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
        await drive.files.delete({
            fileId: fileId
        }).catch(err => {
            console.log(err);
        });

        await this.updateQuota(credentials.client_email);
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

