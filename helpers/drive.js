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
import TMDB from "./tmdb.js";

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

/**
 @typedef DriveFile
 @type {Object}
 @property {string} id
 @property {string} name
 @property {string} description
 @property {string} image
 @property {string} backdrop
 @property {string} release_date
 @property {string} parentId
 @property {string|number} tmdbId
 @property {string|number} imdbId
 @property {string|Array} genre_ids
 @property {string|number} rating
 */

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

    static async streamMP4(stream, output) {
        return ffmpeg(stream)
            .inputFormat('mp4')
            .videoCodec('h264_nvenc')
            .videoBitrate(8000)
            .audioCodec('libmp3lame')
            // .audioBitrate('128k')
            // .audioChannels(2)
            // .keepDAR()
            .outputOptions('-movflags frag_keyframe+empty_moov')
            // .outputOptions('-movflags empty_moov')
            // .outputOptions('-movflags faststart')
            // .outputOptions('-fflags nobuffer')
            // .outputOptions('-strict experimental')
            // .outputOptions('-avioflags direct')
            .toFormat('mp4')
            .on('progress', progress => {
                console.log(progress);
            })
            .on('error', err => {
                console.error(err.message);
            })
            .pipe(output, { end: true });
    }

    static async convertToMP4(stream, filePath) {
        const convertedFileName = `${filePath}.mp4`;
        console.log('CONVERTED FILE PATH:', convertedFileName);

        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(stream)
                .videoCodec('libx264')
                .videoBitrate('10000k')
                .audioCodec('aac')
                .audioBitrate('128k')
                .audioChannels(2)
                .format('mp4')
                .on('progress', progress => console.log(progress))
                .on('error', err => {
                    console.error(err);
                    reject(err);
                })
                .on('end', () => {
                    console.log('Finished processing');
                    resolve(convertedFileName);
                })
                .save(convertedFileName);
        });
    }

    /**
     * @param options {Object}
     * @param options.url {String}
     * @param options.outputName {String}
     * @param options.parentId {String}
     * @param options.tmdbId {String}
     * @param options.convert {Boolean}
     * @param options.file_size {Number}
     * @param options.filename {String}
     * @param stream {ReadableStream}
     * @param onProgress {Function}
     * @returns {Promise<drive_v3.Schema$File>}
     */
    static async uploadFromStream(options, stream, onProgress = () => {}) {
        const movie = await TMDB.getMovie(options.tmdbId);

        const metadata = {
            name: options.outputName,
            parents: [config.fileId],
            appProperties: {
                parentId: options.parentId,
                image: movie.image,
                backdrop: movie.backdrop,
                release_date: movie.release_date,
                tmdbId: options.tmdbId,
                imdbId: movie.imdbId,
                genre_ids: movie.genre_ids.join(','),
                rating: movie.rating,
                upload_date: moment().format('YYYY-MM-DD HH:mm:ss.SSSZ')
            }
        };

        const media = {
            mimeType: mime.getType(options.filename),
            body: stream
        };

        const cred = await IamHelper.getAccountWithEnoughQuota(options.file_size);
        const token = new google.auth.JWT(
            cred.client_email,
            null,
            cred.private_key,
            ['https://www.googleapis.com/auth/drive'],
            null
        );

        console.log('FILE SIZE:', options.file_size);
        await this.addQuota(cred.client_email, options.file_size); // Reserve quota for simultaneous uploads

        let time = new Date().getTime();
        const res = await drive.files.create({
            auth: token,
            resource: metadata,
            media: media,
            fields: 'id'
        }, {
            onUploadProgress: e => {
                const progress = Math.round(Number(e.bytesRead.toString()) * 10000 / Number(options.file_size)) / 100;

                let now = new Date().getTime();

                if (now - time >= 2000) {
                    onProgress(progress);
                    time = now;
                }
            }
        }).catch(err => {
            console.error(err);
        });

        const fileAccount = new FileAccount({
            file_id: res.data.id,
            account_email: cred.client_email
        });

        await fileAccount.save();
        await this.updateQuota(cred.client_email);

        return res.data;
    }

    /**
     * @param options {Object}
     * @param options.url {String}
     * @param options.outputName {String}
     * @param options.parentId {String}
     * @param options.tmdbId {String}
     * @param options.convert {Boolean}
     * @param onProgress {Function}
     * @returns {Promise<*>}
     */
    static async uploadFromTorrent(options, onProgress = () => {}) {
        const client = new WebTorrent();
        let filePath = null, torrentPath = null;
        const opts = {...options};

        let stream = await new Promise(resolve => {
            client.add(options.url, torrent => {
                torrentPath = torrent.path;
                let selected = torrent.files[0];
                torrent.files.forEach(file => {
                    if (file.length > selected.length)
                        selected = file;
                });

                opts.filename = selected.name;
                filePath = selected.path;

                opts.file_size = selected.length;

                resolve(selected.createReadStream());
            });
        });

        if (options.convert) {
            const fullPath = `${torrentPath}/${filePath}`;

            // Convert to MP4 before uploading to Google Drive
            const convertedFilePath = (await this.convertToMP4(stream, fullPath)).toString();
            stream = fs.createReadStream(convertedFilePath);
            opts.file_size = fs.statSync(convertedFilePath).size;
        }

        return this.uploadFromStream(opts, stream, progress => onProgress({ progress, speed: client.downloadSpeed }))
            .finally(() => {
                if (filePath) {
                    // Delete file at the end of upload
                    try {
                        fs.rmSync(filePath, { recursive: true });
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
    }

    /**
     * @param options {Object}
     * @param options.url {String}
     * @param options.outputName {String}
     * @param options.parentId {String}
     * @param options.tmdbId {String}
     * @param onProgress {Function}
     * @returns {Promise<*>}
     */
    static async uploadFromUrl(options, onProgress = () => {}) {
        const opts = {...options};
        const response = await axios.get(options.url, {
            responseType: 'stream'
        });
        const stream = response.data;

        opts.file_size = response.data.headers['content-length'];

        return this.uploadFromStream(opts, stream, onProgress);
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

    /**
     * @param file {DriveFile}
     * @returns {Promise<void>}
     */
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
                    backdrop: file.backdrop,
                    release_date: file.release_date,
                    parentId: file.parentId,
                    tmdbId: file.tmdbId,
                    imdbId: file.imdbId,
                    genre_ids: genreIds,
                    rating: file.rating
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

    static getFileStream(fileId, headers) {
        return drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, {
            responseType: 'stream',
            headers
        });
    }

};

