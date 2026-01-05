import {Server} from 'socket.io';
import http from 'http';
import express from 'express';
import { SocketMiddleware } from '../middlewares/SocketMiddleware.js';
import { addUserToRoom, handlerUserConnect, removeUserFromOnline } from './socketHandlers.js';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

io.use(SocketMiddleware);


io.on("connection", async (socket) => {

    handlerUserConnect(io, socket);

    addUserToRoom(socket);

    socket.on("disconnect", () => {
        removeUserFromOnline(io, socket);
    })

})

export {io, app, server}

