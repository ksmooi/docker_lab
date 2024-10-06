# How to Initialize the Dgraph and Ratel Services Using Docker Compose

This guide explains how to initialize Dgraph and Ratel services using Docker Compose. Dgraph, a powerful graph database, and Ratel, its intuitive UI, are essential tools for managing and querying graph-based data efficiently.

## Step 1: Verify the Directory Structure

Before starting the services, ensure that the required directory structure is in place. Specifically, the directory `docker_lab/host/dgraph/` must exist, as it is mounted as a volume inside the Dgraph container for persistent data storage.

Expected directory structure:

```
docker_lab
├── docker
│   ├── compose.yml
│   └── env
│       └── dgraph.env
└── host
    └── dgraph
```

Ensure that the `dgraph` directory exists under the `host/` directory to enable proper volume mapping for data persistence.

## Step 2: Prepare the `dgraph.env` File

The Docker Compose configuration (`docker/compose.yml`) refers to an environment file located at `docker/env/dgraph.env`. You must ensure that this file is present and contains the necessary configuration variables for Dgraph.

Example content of `dgraph.env`:

```bash
DGRAPH_URL=http://localhost:9080
DGRAPH_GRPC_PORT=9080
DGRAPH_ALPHA_PORT=9080
#DGRAPH_RATEL_PORT=8000
DGRAPH_LOG_LEVEL=INFO
DGRAPH_ACCESS_TOKEN=
DGRAPH_CORS=*
```

Make sure the environment file reflects your specific configuration needs, including access tokens and CORS settings if required.

## Step 3: Start the Dgraph and Ratel Services

To start both the Dgraph and Ratel services, execute the following command in your terminal:

```bash
docker compose -f docker/compose.yml up dgraph ratel
```

This command performs the following tasks:
- Pulls the Docker images for Dgraph (`dgraph/standalone:v24.0.2`) and Ratel (`dgraph/ratel:v21.03.2`) if they are not already available locally.
- Starts the **Dgraph Alpha** service, which listens on port `9080`.
- Starts the **Ratel UI** service, which runs on port `8000`.

These services will now be up and running, allowing you to interact with Dgraph via the Ratel user interface.

## Step 4: Verify the Services

After starting the services, you can verify that both the Dgraph and Ratel containers are running by using the following command:

```bash
docker ps
```

This command will display a list of running containers. You should see entries for both `dgraph` and `dgraph_ratel`, indicating that the services are active.

## How to Access the Dgraph Service with Ratel

### Step 1: Access the Ratel UI

Once the Dgraph and Ratel services are running, you can access the Ratel UI by opening a web browser and navigating to:

```
http://localhost:8000
```

Ratel is a web-based interface designed to help users manage, query, and visualize their graph data in Dgraph. It simplifies interaction with the database by providing tools for running queries and managing schemas.

### Step 2: Connect Ratel to the Dgraph Alpha Server

After accessing the Ratel UI in your browser, follow these steps to connect it to your Dgraph Alpha instance:

1. In the "Server URL" field of the Ratel UI, enter the address of the Dgraph Alpha server. Since the Dgraph service is running locally, use the following URL:

   ```
   http://localhost:9080
   ```

2. Click the "Connect" button to establish a connection between Ratel and the Dgraph Alpha server.

Once connected, you can start running queries, managing schemas, and exploring your graph data through the Ratel interface.

## Summary

### Initialization:
- Ensure the necessary directories (`host/dgraph/`) and environment files (`dgraph.env`) are in place.
- Start both the Dgraph and Ratel services using the command `docker compose up`.

### Accessing Dgraph via Ratel:
- Access the Ratel UI at `http://localhost:8000` in your web browser.
- Connect the Ratel UI to the Dgraph Alpha server using the URL `http://localhost:9080`.

By following these steps, you can efficiently initialize and manage your Dgraph graph database and interact with it using the Ratel user interface. This setup allows for easy querying, schema management, and visualization of your graph data.

