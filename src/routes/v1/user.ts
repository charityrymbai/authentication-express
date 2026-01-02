import express, { type Request, type Response } from 'express';

import * as controller from '../../controllers/user.ts';  

const router = express.Router(); 

router.get('/', controller.healthCheck); 

export default router; 