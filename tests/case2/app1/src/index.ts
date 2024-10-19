import express from 'express';
import { Client } from 'pg';  // PostgreSQL
import redis from 'redis';
import mongoose from 'mongoose';  // MongoDB

const app = express();
const port = 3001;

// PostgreSQL connection
const pgClient = new Client({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});
pgClient.connect();

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
  res.send('App1: Connected to PostgreSQL, MongoDB, and Redis!');
});

app.listen(port, () => console.log(`App1 running on port ${port}`));
