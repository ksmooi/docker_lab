# How to Initialize the RabbitMQ Service Using Docker Compose

This guide will walk you through the steps to initialize and manage a RabbitMQ service using Docker Compose. RabbitMQ is a robust message broker that supports various messaging protocols, and this setup includes the management UI for easier administration.

## Step 1: Verify Directory Structure

Ensure that the directory structure for RabbitMQ is set up correctly. The directory `docker_lab/host/rabbitmq/` must exist, as it is mapped as a volume inside the RabbitMQ container to persist data.

The expected directory structure is:

```
docker_lab
├── docker
│   ├── compose.yml
│   └── env
│       └── rabbitmq.env
└── host
    └── rabbitmq
```

Ensure that the `rabbitmq` directory exists under the `host/` directory for proper volume mapping.

## Step 2: Prepare the `rabbitmq.env` File

The `docker/compose.yml` file references an environment file located at `docker/env/rabbitmq.env`. Ensure that this file exists and contains the necessary environment variables for RabbitMQ.

Here is an example `rabbitmq.env` file:

```bash
RABBITMQ_DEFAULT_USER=guest       # Default RabbitMQ user
RABBITMQ_DEFAULT_PASS=guest       # Default RabbitMQ password
RABBITMQ_DEFAULT_VHOST=/          # Default virtual host (optional)
```

This file sets up the default user credentials for RabbitMQ, which can be modified according to your needs.

## Step 3: Start the RabbitMQ Service

Once the directory structure and environment file are in place, you can start the RabbitMQ service using the following command:

```bash
docker compose -f docker/compose.yml up rabbitmq
```

This command will:
- Pull the RabbitMQ Docker image (`rabbitmq:3.13.7-management`) if it’s not already available locally.
- Start the RabbitMQ container with ports `5672` (messaging) and `15672` (management UI) exposed.
- Mount the `rabbitmq_data` volume and the `host/rabbitmq` directory for data persistence.

## Step 4: Verify the RabbitMQ Service

After starting the RabbitMQ service, verify that the container is running by using the following command:

```bash
docker ps
```

This will list all running containers. You should see the `rabbitmq` container in the list, confirming that the service is active.

## Step 5: Access the RabbitMQ Management UI

Once the RabbitMQ service is running, you can access the RabbitMQ Management UI via your web browser. Navigate to:

```
http://localhost:15672
```

Use the default credentials (or the credentials from your `rabbitmq.env` file):

```
Username: guest
Password: guest
```

This UI provides a comprehensive interface for managing RabbitMQ, including setting up queues, exchanges, bindings, and monitoring system metrics.

## Step 6: Verify Data Persistence

RabbitMQ stores its data in the `rabbitmq_data` volume and in the `host/rabbitmq` directory on your host machine. To verify that data persistence is working correctly, inspect the contents of the RabbitMQ data directory inside the container by running:

```bash
docker exec -it rabbitmq ls /var/lib/rabbitmq
```

This will show the contents of the RabbitMQ data directory, ensuring that data is being stored persistently.

## Step 7: Stop and Restart the RabbitMQ Service

To stop the RabbitMQ service, use:

```bash
docker compose -f docker/compose.yml down
```

To restart the service later, use:

```bash
docker compose -f docker/compose.yml up -d rabbitmq
```

This will bring the RabbitMQ container back up in detached mode, allowing it to run in the background.

## Summary

1. **Prepare the Directory and Environment Files**:
   - Ensure that the `host/rabbitmq/` directory exists for data persistence.
   - Create the `rabbitmq.env` file with the necessary environment variables.

2. **Start the Service**:
   - Use `docker compose -f docker/compose.yml up` to start the RabbitMQ service.

3. **Access the Service**:
   - Access the RabbitMQ Management UI at `http://localhost:15672` using the credentials in `rabbitmq.env`.

4. **Verify Data Persistence**:
   - Ensure that data is being persisted in the `rabbitmq_data` volume and the `host/rabbitmq/` directory.

By following these steps, you can successfully initialize and manage the RabbitMQ service using Docker Compose, with full access to the RabbitMQ Management UI for easier monitoring and configuration.

