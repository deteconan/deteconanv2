import googleapis from 'googleapis';
const { google } = googleapis;
import axios from 'axios';
import admin from '../credentials/admin.json';
import Folder from '../models/folders.js';
import FileAccount from '../models/files_accounts.js';
import config from '../credentials/config.json';
import WebTorrent from 'webtorrent';
import mime from 'mime';
import Credentials from "../models/credentials.js";
import {uploadImage} from "./utils.js";
import IamHelper from "./iam.js";
import moment from 'moment';
import fs from 'fs';

import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

console.log('FFMPEG found at', ffmpegStatic);
console.log('FFPROB found at', ffprobeStatic.path);

const jwToken = new google.auth.JWT(
    admin.client_email,
    null,
    admin.private_key,
    ['https://www.googleapis.com/auth/drive'],
    null
);

const drive = google.drive({
    version: 'v3',
    auth: jwToken
});

export default class DriveHelper {

    static async grantUserWritePermission(fileId, email) {
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

    static async grantUserReadPermission(fileId, email) {
        const res = await drive.permissions.create({
            resource: {
                type: 'user',
                role: 'reader',
                emailAddress: email
            },
            fileId: fileId,
            sendNotificationEmail: false
        });

        return res.data;
    }

    static async getQuota(accountEmail = admin.client_email) {
        const cred = await Credentials.findOne({ client_email: accountEmail });

        const token = new google.auth.JWT(
            cred.client_email,
            null,
            cred.private_key,
            ['https://www.googleapis.com/auth/drive'],
            null
        );

        const res = await drive.about.get({
            fields: 'storageQuota',
            auth: token
        });

        return res.data.storageQuota;
    }

    static async addQuota(accountEmail, quota) {
        if (!accountEmail || !quota)
            return;

        const account = await Credentials.findOne({ client_email: accountEmail });

        await Credentials.findOneAndUpdate({ client_email: accountEmail }, { remaining_quota: account.remaining_quota - quota });
    }

    static async updateQuota(accountEmail = null) {
        let accounts = [];

        if (accountEmail)
            accounts = await Credentials.find({ client_email: accountEmail });
        else
            accounts = await Credentials.find();

        for (let account of accounts) {
            const token = new google.auth.JWT(
                account.client_email,
                null,
                account.private_key,
                ['https://www.googleapis.com/auth/drive'],
                null
            );

            const res = await drive.about.get({
                fields: 'storageQuota',
                auth: token
            });

            const remaining = parseInt(res.data.storageQuota.limit) - parseInt(res.data.storageQuota.usage);
            await Credentials.updateOne({ client_email: account.client_email }, { $set: { remaining_quota: remaining } });
            console.log(account.client_email, '-> quota updated');
        }
    }

    static async getTotalUsage() {
        const accounts = await Credentials.find();

        let total = 0;
        for (let account of accounts) {
            let quota = await this.getQuota(account.client_email);
            total += parseInt(quota.usage);
        }

        return total;
    }

    static async uploadFromTorrent(options, onProgress) {
        let client = new WebTorrent();
        let fileSize = 0, filename = '', filePath = null;

        let stream = await new Promise(resolve => {
            client.add(options.url, torrent => {
                let selected = torrent.files[0];
                torrent.files.forEach(file => {
                    if (file.length > selected.length)
                        selected = file;
                });

                fileSize = selected.length;
                filename = selected.name;
                filePath = selected.path;

                resolve(selected.createReadStream());
            });
        });

        if (options.convert) {
            // Convert to MP4 before uploading to Google Drive
            stream = ffmpeg()
                .input(stream)
                .videoCodec('libx264')
                .audioCodec('libmp3lame')
                .format('mp4')
                .on('progress', progress => console.log(progress))
                .on('end', () => console.log('Finished processing'));
        }

        const metadata = {
            name: options.outputName,
            parents: [config.fileId],
            appProperties: {
                parentId: options.parentId,
                image: options.image,
                release_date: options.releaseDate,
                tmdbId: options.tmdbId,
                genre_ids: options.genreIds.join(','),
                upload_date: moment().format('YYYY-MM-DD HH:mm:ss.SSSZ')
            }
        };

        let media = {
            mimeType: mime.getType(filename),
            body: stream
        };

        const cred = await IamHelper.getAccountWithEnoughQuota(fileSize);
        const token = new google.auth.JWT(
            cred.client_email,
            null,
            cred.private_key,
            ['https://www.googleapis.com/auth/drive'],
            null
        );

        await this.addQuota(cred.client_email, fileSize); // Reserve quota for simultaneous uploads

        let time = new Date().getTime();
        const res = await drive.files.create({
            auth: token,
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
                        onProgress({
                            progress,
                            speed: client.downloadSpeed
                        });
                        time = now;
                    }
                }
            }
        }).catch(err => {
            console.error(err);
        }).finally(() => {
            if (filePath) {
                fs.rmdirSync(filePath, { // Delete file at the end of upload
                    recursive: true
                });
            }
        });

        const fileAccount = new FileAccount({
            file_id: res.data.id,
            account_email: cred.client_email
        });

        await fileAccount.save();
        await this.updateQuota(cred.client_email);

        return res.data;
    }

    static async uploadFromUrl(outputName, url, parentId, image = null, releaseDate = null, onProgress) {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const quota = await this.getQuota();
        const fileSize = response.data.headers['content-length'];
        console.log('file size: ' + fileSize);
        console.log('quota remaining: ' + ( Number(quota.limit) - (Number(quota.usage) + Number(fileSize)) ));

        let thumbnail = null;
        if (image) {
            if (image) {
                console.log('Uploading thumbnail...');
                const thumbnailLink = image.split('_V1_').join('_V1_UX182_CR0,0,182,268_AL_'); // To get Imdb thumbnail
                console.log('Small:', thumbnailLink);
                thumbnail = await uploadImage(thumbnailLink);
                console.log('Thumbnail uploaded: ' + thumbnail);
            }

            console.log('Uploading poster...');
            console.log('Big:', image);
            image = await uploadImage(image);
            console.log('Poster uploaded: ' + image);
        }

        let metadata = {
            name: outputName,
            parents: [config.fileId],
            appProperties: {
                parentId,
                upload_date: moment().format('YYYY-MM-DD HH:mm:ss.SSSZ')
            }
        };

        let media = {
            mimeType: response.data.headers['content-type'],
            body: response.data
        };

        const cred = await IamHelper.getAccountWithEnoughQuota(fileSize);
        const token = new google.auth.JWT(
            cred.client_email,
            null,
            cred.private_key,
            ['https://www.googleapis.com/auth/drive'],
            null
        );

        let time = new Date().getTime();
        const res = await drive.files.create({
            auth: token,
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
            account_email: cred.client_email
        });

        await fileAccount.save();
        await this.updateQuota(cred.client_email);

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

    static async updateFile(file) {
        const fileAccount = await FileAccount.findOne({ file_id: file.id });
        const cred = await Credentials.findOne({ client_email: fileAccount.account_email });

        const token = new google.auth.JWT(
            cred.client_email,
            null,
            cred.private_key,
            ['https://www.googleapis.com/auth/drive'],
            null
        );

        const genreIds = Array.isArray(file.genre_ids) ? file.genre_ids.join(',') : file.genre_ids;

        await drive.files.update({
            fileId: file.id,
            auth: token,
            resource: {
                name: file.name,
                description: file.description,
                appProperties: {
                    image: file.image,
                    release_date: file.release_date,
                    parentId: file.parentId,
                    tmdbId: file.tmdbId,
                    genre_ids: genreIds
                }
            }
        }).catch(err => {
            console.error(err);
        });
    }

    static async deleteFile(fileId) {
        const fileAccount = await FileAccount.findOne({ file_id: fileId });
        const cred = await Credentials.findOne({ client_email: fileAccount.account_email });

        const token = new google.auth.JWT(
            cred.client_email,
            null,
            cred.private_key,
            ['https://www.googleapis.com/auth/drive'],
            null
        );

        await drive.files.delete({
            fileId: fileId,
            auth: token
        }).catch(err => {
            console.log(err);
        });

        await this.updateQuota(admin.client_email);
        await FileAccount.deleteOne({ file_id: fileId });
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

