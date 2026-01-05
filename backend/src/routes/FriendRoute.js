import express from 'express';
import { addFriend, acceptFriendRequest, getAllFriend, getFriendRequests, declinedFriendRequest } from '../controller/FriendController.js';

const router = express.Router();

router.post("/requests", addFriend);

router.post("/requests/:requestId/accept", acceptFriendRequest);

router.post("/requests/:requestId/decline", declinedFriendRequest);

router.get("/", getAllFriend);

router.get("/requests", getFriendRequests);

export default router;



