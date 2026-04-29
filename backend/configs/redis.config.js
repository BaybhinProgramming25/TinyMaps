import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  }
});

redisClient.on('error', (err) => console.error('Redis error:', err));

export const redisConnect = async () => {
  await redisClient.connect();
  console.log('Redis connected');
};

export const redisClose = async () => {
  await redisClient.disconnect();
  console.log('Redis disconnected');
};

export { redisClient };
