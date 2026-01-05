import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './libs/database.js';
import AuthRoute from './routes/AuthRoute.js';
import userRoute from './routes/UserRoute.js';
import FriendRoute from './routes/FriendRoute.js';
import MessageRoute from './routes/MessageRoute.js';
import ConversationRoute from './routes/ConversationRoute.js';
import cookieParser from 'cookie-parser';
import { ProtectedRoute } from './middlewares/AuthMiddleware.js';
import NotificationRoute from './routes/NotificationRoute.js'
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import {app, server} from './socket/socket.js';



dotenv.config();

const PORT = process.env.PORT;

// Middlewares //

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));

// swagger //

const swaggerDocument = JSON.parse(fs.readFileSync("./src/Swagger.json", "utf8"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// Public Routes //

app.use('/api/auth', AuthRoute);


// Private Routes //
app.use(ProtectedRoute);
app.use('/api/users', userRoute);
app.use('/api/friends', FriendRoute);
app.use('/api/messages', MessageRoute);
app.use('/api/conversations', ConversationRoute);
app.use('/api/notifications', NotificationRoute);



connectDB().then(() => {
    server.listen(PORT, () => {
    console.log(`Server đã bắt đầu chạy trên cổng ${PORT}`);
   });
});
