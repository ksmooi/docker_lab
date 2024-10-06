# Guide to Initializing MongoDB with Docker Compose

This article provides a step-by-step guide to initializing and managing a MongoDB service using Docker Compose. By leveraging environment files and Docker volumes, you can set up MongoDB with persistent data and access control in a containerized environment.

## Step 1: Configure the MongoDB Environment File

In the `docker-compose.yml` file, the `env_file` directive points to `docker/env/mongodb.env`. This file should contain the necessary environment variables to initialize MongoDB, including the root username, password, and an optional default database.

Create or edit the `docker/env/mongodb.env` file with the following content:

```bash
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=examplepassword
MONGO_INITDB_DATABASE=mydatabase
```

### Explanation of Environment Variables:
- **MONGO_INITDB_ROOT_USERNAME**: Specifies the root user's username for MongoDB.
- **MONGO_INITDB_ROOT_PASSWORD**: Defines the password for the root user.
- **MONGO_INITDB_DATABASE**: (Optional) Automatically creates a default database during initialization.

## Step 2: Ensure Correct Directory Structure

Ensure that the volume mapping in `docker-compose.yml` (`../host/mongodb:/host`) correctly references the `docker_lab/host/mongodb` directory in your project. This allows you to store any additional MongoDB data or initialization scripts.

## Step 3: Start the MongoDB Service

Once the `docker-compose.yml` and `mongodb.env` files are configured, start the MongoDB service by running:

```bash
docker compose -f docker/compose.yml up mongodb
```

This command will:
- Pull the `mongodb-community-server:8.0.0-ubuntu2204` image.
- Start the MongoDB container using the environment variables from the `mongodb.env` file.
- Map port `27017` (MongoDB’s default port) from the container to the host.
- Persist MongoDB data using the `mongodb_data` volume.

## Step 4: Verify the MongoDB Service

After starting MongoDB, verify that the container is running by using the following command:

```bash
docker ps
```

This will display the running containers, and you should see the MongoDB container listed as `mongodb`.

## Step 5: Access the MongoDB Shell

To connect to the MongoDB instance running inside the container, open a MongoDB shell with the following command:

```bash
docker exec -it mongodb mongosh -u root -p examplepassword --authenticationDatabase admin
```

Replace `root` and `examplepassword` with the values from your `mongodb.env` file. This command provides access to the MongoDB shell where you can manage databases and users.

## Step 6: Verify Data Persistence

To ensure that MongoDB data is being stored correctly in the container, you can check the `/data/db` directory using the following command:

```bash
docker exec -it mongodb ls /data/db
```

This command lists the contents of the MongoDB data directory, confirming that the data is being stored persistently.

## Step 7: Restart or Stop the MongoDB Service

If you need to stop or restart the MongoDB service, use the following commands:

- **Stop the MongoDB container**:
  ```bash
  docker compose -f docker/compose.yml down
  ```

- **Restart the MongoDB container**:
  ```bash
  docker compose -f docker/compose.yml up -d mongodb
  ```

These commands will stop or restart the MongoDB service while preserving the data stored in the Docker volume.

## Summary of Steps

1. Configure the MongoDB environment variables in `docker/env/mongodb.env`.
2. Start the MongoDB service using `docker compose up`.
3. Verify that the service is running using `docker ps` and connect to MongoDB using `docker exec`.
4. Ensure data persistence by checking the contents of the data volume.
5. Stop or restart the MongoDB service as needed.

By following these steps, you can successfully initialize and manage a MongoDB service using Docker Compose. This setup ensures that MongoDB data is persistent and the service is easy to manage in a containerized environment.
