import express, { type Request, type Response } from 'express'; 

import * as controller from '../../controllers/auth.ts'; 

const router = express.Router(); 

router.get('/', controller.healthCheck);
router.post('/signup', controller.signup);  
router.post('/signin', controller.signin);  
router.post('/signout', controller.signout);
router.post('/refresh', controller.refreshAccessToken)

export default router; 