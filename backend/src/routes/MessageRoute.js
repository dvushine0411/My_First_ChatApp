import express from 'express';
import { SendDirectMessage, SendGroupMessage } from '../controller/MessageController.js';
import { CheckFriendship, CheckGroupMembership } from '../middlewares/FriendMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/direct', upload.single("image"), CheckFriendship, SendDirectMessage);

router.post('/group', upload.single("image"), CheckGroupMembership, SendGroupMessage);

export default router;

