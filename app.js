import express from 'express';
import path from 'path';
import { sendError } from './helpers/utils.js';
import DB from './helpers/DB.js';
import './helpers/mongodb.js';
import DriveHelper from "./helpers/drive.js";
import http from 'http';
import SocketIO from 'socket.io';
import Sockets from './helpers/sockets.js';
import schedule from 'node-schedule';
import filesRoutes from './routes/files.js';
import usersRoutes from './routes/users.js';
import moviesRoutes from './routes/movies.js';
import compression from 'compression';
import TorrentSearchApi from "torrent-search-api";

// Load custom providers
TorrentSearchApi.loadProvider(path.resolve('./torrent-providers/TorrentGalaxy.json'));
TorrentSearchApi.loadProvider(path.resolve('./torrent-providers/Nyaa.json'));

const app = express();
DB.init();

if (process.env.NODE_ENV) { // Not in local
  DriveHelper.updateQuota();
  schedule.scheduleJob({hour: 23, minute: 0}, async () => { // Every days at 11pm
    await DriveHelper.updateQuota();
  });
}

// HTTP codes
global.HTTP_OK = 200;
global.HTTP_BAD_REQUEST = 400;
global.HTTP_UNAUTHORIZED = 401;
global.HTTP_FORBIDDEN = 403;
global.HTTP_NOT_FOUND = 404;
global.HTTP_INTERNAL_ERROR = 500;

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-with, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Serve vue app
app.use(express.static(`app/dist`));
app.get(/^(?:(?!\bapi\b).)*$/, (req, res) => {
  res.sendFile(path.join(process.cwd(), `app/dist/index.html`));
});

app.use('/api', filesRoutes);
app.use('/api', usersRoutes);
app.use('/api', moviesRoutes);

// Error handler
app.use(sendError);

// Start server
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = SocketIO(server);
global.io = io;
Sockets.createSockets(io);

server.listen(port, () => console.log('Users service listening on ' + port));
