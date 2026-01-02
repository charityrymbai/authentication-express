import express, { type Request, type Response } from 'express';

import * as controller from '../../controllers/user.ts';  

const router = express.Router(); 

router.get('/', controller.healthCheck); 
router.patch('/update', controller.updateUser); 

export default router; 