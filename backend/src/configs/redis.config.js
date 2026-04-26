const redis = require('redis')

const redisClient = redis.createClient({
    socket: {
        host: 'redis',
        port: 6379,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                return new Error('Max retries reached')
            }
            return retries * 500;
        }
    }
});

const redisConnect = async () => {

    const response = await redisClient.connect();
    if(!response) {
        console.error('Redis failed to connect')
    }
    console.log('Connected successfully to Redis!')
}

const redisClose = async () => {

    await redisClient.quit();

}

module.exports = { redisClient, redisConnect, redisClose }