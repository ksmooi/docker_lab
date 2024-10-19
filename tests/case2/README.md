# Building a Multi-Container Application with Shared Backend Services Using Two Docker Compose Files

In this article, we will demonstrate how to build a multi-container application using Docker Compose. The project involves two separate applications (`app1` and `app2`), each running in its own container and sharing common backend services, such as PostgreSQL, MySQL, MongoDB, and Redis. To keep the configuration modular and manageable, we will use two Docker Compose files:

1. **`service.yml`**: For setting up the backend services.
2. **`app.yml`**: For setting up the application containers (`app1` and `app2`).

By separating these configurations, we can manage and scale each part of the system more efficiently.

## Project Structure

Here is the directory structure for the project:

```
docker_lab/
├── docker/
│   ├── compose.yml
│   ├── env/
│   │   ├── dgraph.env
│   │   ├── mongodb.env
│   │   ├── mysql.env
│   │   ├── postgres.env
│   │   ├── qdrant.env
│   │   └── rabbitmq.env
│   └── README.md
└── tests/
    └── case2/
        ├── app1/
        │   ├── app1.docker
        │   └── src/
        │       └── index.ts
        ├── app2/
        │   ├── app2.docker
        │   └── src/
        │       └── index.ts
        ├── service.yml
        └── app.yml
```

### Backend Services (`service.yml`)

The first Docker Compose file (`service.yml`) defines the backend services required by both applications, such as PostgreSQL, MySQL, MongoDB, and Redis.

**File Path**: `tests/case2/service.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16.4
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_net

  mysql:
    image: mysql:8.0.39
    environment:
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DB: ${MYSQL_DB}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app_net

  mongodb:
    image: mongodb/mongodb-community-server:8.0.0-ubuntu2204
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - app_net

  redis:
    image: redis:7.4.0
    ports:
      - "6379:6379"
    networks:
      - app_net

volumes:
  postgres_data:
  mysql_data:
  mongodb_data:

networks:
  app_net:
    driver: bridge
```

### Explanation:

- **PostgreSQL, MySQL, MongoDB, and Redis** services are defined and run on the `app_net` network, which enables communication between services and the applications.
- Each service exposes the necessary ports to allow access from the applications and, if needed, from outside the containers.

### Application Services (`app.yml`)

The second Docker Compose file (`app.yml`) defines the two Node.js applications (`app1` and `app2`). Each application will communicate with the shared backend services.

**File Path**: `tests/case2/app.yml`

```yaml
version: '3.8'

services:
  app1:
    build:
      context: ./app1
      dockerfile: app1.docker
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      MONGODB_HOST: mongodb
      MONGODB_PORT: 27017
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - mongodb
      - redis
    networks:
      - app_net

  app2:
    build:
      context: ./app2
      dockerfile: app2.docker
    environment:
      MYSQL_HOST: mysql
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DB: ${MYSQL_DB}
      MONGODB_HOST: mongodb
      MONGODB_PORT: 27017
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "3002:3002"
    depends_on:
      - mysql
      - mongodb
      - redis
    networks:
      - app_net

networks:
  app_net:
    external: true
```

### Explanation:

- **`app1`** uses PostgreSQL, MongoDB, and Redis, while **`app2`** uses MySQL, MongoDB, and Redis.
- Both applications are built using their respective Dockerfiles (`app1.docker` and `app2.docker`) and are connected to the same backend services via the `app_net` network.
- Ports `3001` and `3002` are exposed for `app1` and `app2`, respectively.

### Dockerfile for `app1` and `app2`

To build and run both `app1` and `app2`, you need to define Dockerfiles for each application.

### `app1.docker`
**File Path**: `tests/case2/app1/app1.docker`

```Dockerfile
# Use official Node.js LTS image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app1

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code
COPY ./src ./src

# Install TypeScript globally and compile the source code
RUN npm install -g typescript && tsc

# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/index.js"]
```

### `app2.docker`
**File Path**: `tests/case2/app2/app2.docker`

```Dockerfile
# Use official Node.js LTS image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app2

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code
COPY ./src ./src

# Install TypeScript globally and compile the source code
RUN npm install -g typescript && tsc

# Expose the application port
EXPOSE 3002

# Command to run the application
CMD ["node", "dist/index.js"]
```

### How to Use These Dockerfiles in the Build Process

Each application (`app1` and `app2`) has its own Dockerfile, defining how to build the container for the application. Docker Compose uses these Dockerfiles when you run the `docker-compose` command for building and running the containers.

### Step-by-Step: Running the Setup

#### Step 1: Start the Backend Services

Navigate to the directory containing `service.yml` and run the backend services:

```bash
cd docker_lab/tests/case2
docker-compose -f service.yml up -d
```

This will start PostgreSQL, MySQL, MongoDB, and Redis, and create the necessary Docker network (`app_net`).

#### Step 2: Build and Start the Applications

Next, build and run the two applications (`app1` and `app2`) by running the following command in the same directory:

```bash
docker-compose -f app.yml up --build
```

This command will:
- Build the Docker images for `app1` and `app2` using their respective Dockerfiles.
- Start the applications and ensure they connect to the backend services using the shared `app_net` network.

### Application Code (TypeScript)

Here is a brief overview of the application code for `app1` and `app2`. Both applications are written in TypeScript and use backend services for their functionality.

#### `index.ts` for `app1`

**File Path**: `tests/case2/app1/src/index.ts`

```typescript
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
```

#### `index.ts` for `app2`

**File Path**: `tests/case2/app2/src/index.ts`

```typescript
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
```

### Networking Between Containers

Docker Compose uses the **`app_net`** bridge network to enable communication between the backend services and the applications. This network allows containers to talk to each other using service names (e.g., `postgres`, `mysql`, `mongodb`, `redis`) as hostnames.

The key points regarding networking:
- Both Compose files reference the same `app_net` network, ensuring that applications and services are on the same network.
- Applications connect to the backend services by using the service names (e.g., `postgres`, `mysql`, `mongodb`, `redis`).

### How Many Docker Containers Are Running?

In this setup, the following containers will be running:
1. **PostgreSQL** (1 instance)
2. **MySQL** (1 instance)
3. **MongoDB** (1 instance)
4. **Redis** (1 instance)
5. **app1** (Node.js + TypeScript container)
6. **app2** (Node.js + TypeScript container)

A total of **six containers** will be running simultaneously, where `app1` and `app2` connect to the same backend services.

### Conclusion

By separating the Docker Compose configurations into two parts (`service.yml` for backend services and `app.yml` for applications), we achieve a modular and scalable architecture. This approach allows both applications (`app1` and `app2`) to share the same backend services while running in their own isolated containers.

- The backend services (PostgreSQL, MySQL, MongoDB, Redis) are shared between both applications.
- The Docker Compose networking ensures that all services and applications can communicate seamlessly via a shared bridge network (`app_net`).
- Each application has its own Dockerfile and runs on its own port.

This method provides flexibility and scalability, making it easier to manage and scale each component independently.


