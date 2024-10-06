# How to Initialize the Qdrant Service Using Docker Compose

This guide outlines the steps to initialize and manage the Qdrant service using Docker Compose. Qdrant is a powerful vector search engine designed for machine learning and AI workloads, and this setup ensures data persistence and easy access to its API.

## Step 1: Verify Directory Structure

Before initializing the Qdrant service, ensure the directory structure is properly set up. The directory `docker_lab/host/qdrant/` must exist, as it will be mapped as a volume inside the Qdrant container to persist data.

The directory structure should resemble the following:

```
docker_lab
├── docker
│   ├── compose.yml
│   └── env
│       └── qdrant.env
└── host
    └── qdrant
```

Ensure the `qdrant` directory exists inside the `host/` directory for proper volume mapping.

## Step 2: Prepare the `qdrant.env` File

The `docker/compose.yml` file references an environment file located at `docker/env/qdrant.env`. Ensure this file exists and includes the necessary configuration settings for Qdrant.

### Example `qdrant.env` File:

```bash
# Qdrant service settings
QDRANT__SERVICE__HTTP_PORT=6333                 # HTTP port for Qdrant API
QDRANT__SERVICE__GRPC_PORT=6334                 # gRPC port for internal communication

# Logging settings
QDRANT__LOG_LEVEL=INFO                          # Set logging level (INFO, DEBUG, ERROR)

# Resource allocation
QDRANT__PERFORMANCE__MAX_SEARCH_THREADS=8       # Max threads for parallel search (based on CPU capacity)
QDRANT__PERFORMANCE__MAX_OPTIMIZATION_THREADS=4 # Max threads for data optimization processes

# Vector storage settings
QDRANT__VECTORS__ON_DISK=true                   # Store vectors on disk to manage memory efficiently

# CORS and security settings
QDRANT__CORS=*                                  # Allow all origins for cross-origin requests
QDRANT__API_KEY=                                # Optional: Add an API key for secure access

# Other optional settings
QDRANT__SNAPSHOTS__INTERVAL_SEC=3600            # Create data snapshots every hour
QDRANT__SNAPSHOTS__KEEP_LAST=3                  # Keep the last 3 snapshots to manage storage

# Database settings
QDRANT__STORAGE__COMPRESSION=ZSTD               # Enable data compression to optimize storage space
```

These environment variables configure Qdrant’s service ports, logging, resource allocation, vector storage, and CORS settings.

## Step 3: Start the Qdrant Service

Once the directory structure and environment file are properly configured, start the Qdrant service using the following command:

```bash
docker compose -f docker/compose.yml up qdrant
```

This command will:
- Pull the Qdrant image (`qdrant/qdrant:v1.11.3`) if it’s not already available locally.
- Start the Qdrant container, exposing the API on port `6333` and internal communication on port `6334`.
- Mount the `qdrant_data` volume and the `host/qdrant` directory for persistent data storage.

## Step 4: Verify the Qdrant Service

To verify that the Qdrant container is running, execute the following command:

```bash
docker ps
```

This will list all running containers. You should see `qdrant` listed, confirming that the service is active.

## Step 5: Access the Qdrant API

Once the service is running, you can access the Qdrant API via the following URL:

```
http://localhost:6333
```

This URL provides access to the Qdrant service's REST API, allowing you to manage and query your vector database. A typical response from the API might look like this:

```json
{
  "title": "qdrant - vector search engine",
  "version": "1.11.3",
  "commit": "9fa86106e85d734765efe2c686a3ce975e53fb38"
}
```

You can now interact with Qdrant using the API, send queries, and store vector data.

## Step 6: Verify Data Persistence

Qdrant stores its data in the `qdrant_data` volume and in the `host/qdrant` directory on your host machine. To verify that data persistence is working, check the contents of the `/qdrant/storage` directory inside the container by running:

```bash
docker exec -it qdrant ls /qdrant/storage
```

This command will list the contents of the Qdrant storage directory, confirming that data is being stored persistently.

## Step 7: Stop and Restart the Qdrant Service

To stop the Qdrant service, run:

```bash
docker compose -f docker/compose.yml down
```

To restart the service later, use:

```bash
docker compose -f docker/compose.yml up -d qdrant
```

This will bring the Qdrant container back up in detached mode, allowing it to run in the background.

## Summary

1. **Prepare the Directory and Environment Files**:
   - Ensure that the `host/qdrant/` directory exists for data persistence.
   - Create the `qdrant.env` file with the necessary environment variables.

2. **Start the Service**:
   - Use `docker compose -f docker/compose.yml up` to start the Qdrant service.

3. **Access the Service**:
   - Interact with the Qdrant API at `http://localhost:6333`.

4. **Manage and Verify Data Persistence**:
   - Ensure that data is being persisted in the `qdrant_data` volume and the `host/qdrant/` directory.

By following these steps, you can successfully initialize and manage the Qdrant service using Docker Compose, ensuring data persistence and easy access to its REST API.

