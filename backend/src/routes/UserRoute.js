import express from 'express';
import { AuthMe } from '../controller/UserController.js';
import { searchUsers } from '../controller/UserController.js';

const router = express.Router();

router.get("/me", AuthMe);

router.get("/search", searchUsers);


export default router;
