import express from 'express';
import mysql from 'mysql';  // MySQL
import redis from 'redis';
import mongoose from 'mongoose';  // MongoDB

const app = express();
const port = 3002;

// MySQL connection
const mysqlConnection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
});
mysqlConnection.connect();

// MongoDB connection
mongoose.connect(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/mydb`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Redis connection
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});
redisClient.on('connect', () => console.log('Connected to Redis'));

app.get('/', (req, res) => {
  res.send('App2: Connected to MySQL, MongoDB, and Redis!');
});

app.listen(port, () => console.log(`App2 running on port ${port}`));
