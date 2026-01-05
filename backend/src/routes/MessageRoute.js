import express from 'express';
import { SendDirectMessage, SendGroupMessage } from '../controller/MessageController.js';
import { CheckFriendship, CheckGroupMembership } from '../middlewares/FriendMiddleware.js';

const router = express.Router();

router.post('/direct', CheckFriendship, SendDirectMessage);

router.post('/group', CheckGroupMembership, SendGroupMessage);

export default router;

