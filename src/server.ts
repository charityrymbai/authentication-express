import express, { type Request, type Response } from 'express'; 
import cors from 'cors';
import dotenv from 'dotenv'; 
import cookieParser from 'cookie-parser'; 

import router from './routes/root.ts'; 
import { errorMiddleware } from './middlewares/error.middleware.ts';
import { redisHealthCheck } from './lib/redis.ts';

dotenv.config({ path: '../.env' }); 

const port = process.env.PORT || 3000; 

const app = express(); 

app.use(cors());
app.use(cookieParser()); 
app.use(express.json()); 

app.use('/api', router);

app.get('/health', async (req: Request, res: Response) => {
  const redisHealthOk = await redisHealthCheck(); 
  res.status(200).json({
    redis: redisHealthOk ? 'ok' : 'error'
  })
})

app.use(errorMiddleware); 

app.listen(port, () => {
  console.log(`Listening on port ${port}...`); 
}); 