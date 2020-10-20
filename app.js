import express from 'express';
import path from 'path';
import { sendError } from './helpers/utils.js';
import DB from './helpers/DB.js';
import './helpers/mongodb.js';
import http from 'http';
import SocketIO from 'socket.io';
import Sockets from './helpers/sockets.js';

const app = express();
DB.init();

import filesRoutes from './routes/files.js';

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

// Error handler
app.use(sendError);

// Start server
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = SocketIO(server);
global.io = io;
Sockets.createSockets(io);

server.listen(port, () => console.log('Users service listening on ' + port));
