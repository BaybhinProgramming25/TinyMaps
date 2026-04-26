const express = require('express');
const cookieParser = require('cookie-parser')
const { createProxyMiddleware } = require('http-proxy-middleware')

const mapRouter = require('./src/routes/map');
const userRouter = require('./src/routes/user');
const routeRouter = require('./src/routes/routing')

const { mongoConnect, mongoClose } = require('./src/configs/mongo.config');
const { redisConnect, redisClose } = require('./src/configs/redis.config');

const app = express();

app.use(express.json()); 
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


const startServer = async () => {
  
  try {

    await redisConnect();
    await mongoConnect(); 

    app.use('/', mapRouter);
    app.use('/', routeRouter);
    app.use('/', userRouter);

    app.use('/tile', createProxyMiddleware({
      target: 'http://tileserver:80/',
      changeOrigin: true,
      pathRewrite: {
        '^/tile': '/tile'
      }
    }));

    app.listen(8000, '0.0.0.0')

  } catch (error) {

    console.error('Error starting server:', error);
    process.exit(1); 
  }
}

process.on('SIGINT', async () => {

  await redisClose();
  await mongoClose();
  process.exit(0);

})

startServer();