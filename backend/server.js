import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import userRouter from './routes/user.route.js';
import routeRouter from './routes/route.route.js';
import { redisConnect, redisClose } from './configs/redis.config.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {

    await redisConnect();

    app.use('/', userRouter);
    app.use('/', routeRouter);

    app.listen(8000, '0.0.0.0', () => {
      console.log('Server running on port 8000');
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await redisClose();
  process.exit(0);
});

startServer();
