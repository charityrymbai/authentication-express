import express, { type Request, type Response } from 'express'; 

import userRouter from './user.ts'; 
import authRouter from './auth.ts'; 

const router = express.Router(); 

router.use('/user', userRouter); 
router.use('/auth', authRouter); 

export default router;