import express from 'express'; 
import cors from 'cors';
import dotenv from 'dotenv'; 

import router from './routes/root.ts'; 
import { errorMiddleware } from './middlewares/error.middleware.ts';

dotenv.config({ path: '../.env' }); 

const port = process.env.PORT || 3000; 

const app = express(); 

app.use(cors());

app.use('/api', router); 

app.use(errorMiddleware); 

app.listen(port, () => {
  console.log(`Listening on port ${port}...`); 
}); 