import express from 'express'; 
import { signUp } from '../controller/AuthController.js';
import { signIn } from '../controller/AuthController.js';
import { signOut } from '../controller/AuthController.js';
import { refreshToken } from '../controller/AuthController.js';


const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn); 

router.post("/signout", signOut);

router.post("/refresh", refreshToken);


export default router;
