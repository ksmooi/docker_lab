# Docker Lab - Test Cases Overview

This repository contains multiple test cases designed to demonstrate different application architectures and scenarios using Docker and Docker Compose. Each test case showcases a distinct setup involving backend services, such as databases and search engines, and applications built using different programming languages and frameworks.

## Directory Structure

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
    ├── case1/
    ├── case2/
    ├── case3/
    └── case4/
```

## Test Cases Overview

### Case 1: Node.js App for PostgreSQL Backup to AWS S3

**Directory**: `tests/case1`

- **Objective**: This case demonstrates how to build a Node.js application that automatically backs up a PostgreSQL database and uploads the backup to AWS S3 on a regular schedule.
- **Key Components**:
  - **`app.yml`**: Docker Compose file to manage services, likely including PostgreSQL and the Node.js app.
  - **`node.docker`**: Dockerfile to containerize the Node.js app.
  - **`src/index.ts`**: TypeScript code that schedules PostgreSQL backups, uploads them to S3, and manages temporary backup storage.
- **Features**: Automated, time-driven PostgreSQL backups using Node.js, with secure transfer to AWS S3 via the AWS SDK.

### Case 2: Multi-Application Setup with Node.js

**Directory**: `tests/case2`

- **Objective**: This test case involves two separate Node.js applications (`app1` and `app2`), both of which rely on common backend services like PostgreSQL, MySQL, MongoDB, and Redis.
- **Key Components**:
  - **`app1/`**: Contains the Dockerfile (`app1.docker`) and TypeScript code (`index.ts`) for App1.
  - **`app2/`**: Contains the Dockerfile (`app2.docker`) and TypeScript code (`index.ts`) for App2.
  - **`app.yml`**: Docker Compose file to manage the two application containers.
  - **`service.yml`**: Docker Compose file to manage the shared backend services.
- **Features**: The applications run in separate containers but share common backend services via Docker's network, allowing for communication between the apps and the services.

### Case 3: Retrieval-Augmented Generation (RAG) System

**Directory**: `tests/case3`

- **Objective**: This case sets up a Retrieval-Augmented Generation (RAG) system using Qdrant, Dgraph, and PostgreSQL. The system leverages vector search, graph databases, and relational data to generate enhanced responses based on retrieved data.
- **Key Components**:
  - **`app/`**: Contains the Dockerfile (`app.docker`) and Python code (`app.py`) for the RAG system.
  - **`app.yml`**: Docker Compose file to manage the RAG application.
  - **`service.yml`**: Docker Compose file to manage the backend services (Qdrant, Dgraph, and PostgreSQL).
  - **`env/`**: Environment files for configuring the backend services (`dgraph.env`, `postgres.env`, `qdrant.env`).
- **Features**: A Python-based RAG system that uses gRPC for fast communication between components and integrates Qdrant for vector search, Dgraph for graph management, and PostgreSQL for relational data storage.

### Case 4: Agentic AI System

**Directory**: `tests/case4`

- **Objective**: This case sets up an **Agentic AI system** that leverages multiple backend services, including PostgreSQL, MongoDB, Qdrant, Redis, and RabbitMQ. The system provides a containerized environment for developing intelligent agents, featuring an API built using gRPC for fast communication.
- **Key Components**:
  - **`app/`**: Contains the Dockerfile (`app.docker`) and Python code (`app.py`) for the AI system.
  - **`app.yml`**: Docker Compose file to manage the Python AI application.
  - **`service.yml`**: Docker Compose file to manage the backend services (PostgreSQL, MongoDB, Qdrant, Redis, RabbitMQ).
  - **`env/`**: Environment files for configuring backend services (`postgres.env`, `qdrant.env`, `mongodb.env`, `redis.env`, `rabbitmq.env`).
- **Features**: The system utilizes **PostgreSQL** for relational data, **MongoDB** for document storage, **Qdrant** for vector search, **Redis** for caching and messaging, and **RabbitMQ** for asynchronous communication. The Python app leverages AI libraries such as Langchain, OpenAI, and Transformers for building intelligent agents.



## How to Use

1. Navigate to the relevant test case directory (`case1`, `case2`, or `case3`).
2. Review the `README.md` file in each test case for specific instructions on building and running the containers.
3. Use the provided Docker Compose files to start the services and applications.
4. Customize the environment variables in the `env/` directory as needed for each service.

## Conclusion

Each test case in the `docker_lab` directory demonstrates a different approach to building and running multi-container applications using Docker and Docker Compose. From automating backups to building complex data retrieval systems, these examples provide practical insights into using containerized services for various real-world applications.

