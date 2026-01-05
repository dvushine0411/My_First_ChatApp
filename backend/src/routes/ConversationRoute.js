import express from 'express';
import { createConversation, getConversation, getMessages, markAsSeen } from '../controller/ConversationController.js';
import { CheckFriendship } from '../middlewares/FriendMiddleware.js';


const router = express.Router();

router.post("/", CheckFriendship, createConversation);

router.get("/", getConversation);

router.get("/:conversationId/messages", getMessages);

router.patch("/:conversationId/seen", markAsSeen);

export default router;


