# Summary of the `docker_lab` Project

The **`docker_lab`** project is designed to provide a structured environment for creating, managing, and deploying containerized applications using **Docker** and **Docker Compose**. It focuses on various backend services (databases, message queues, vector search, etc.) and provides a platform for experimenting with different application architectures.

## Key Features of the `docker_lab` Project:

1. **Backend Services**:
   - The project includes multiple backend services, such as **PostgreSQL**, **MySQL**, **MongoDB**, **Redis**, **Qdrant**, **Dgraph**, and **RabbitMQ**.
   - Each service is configured using environment files (`.env`) located in `docker/env/`, and initialization instructions for each service are provided in the `docs/services` directory.

2. **Multiple Test Cases**:
   - The project features several test cases located under the `tests/` directory. These test cases focus on different scenarios and application stacks:
     - **Case 1**: Focuses on a Node.js application that backs up PostgreSQL data to AWS S3.
     - **Case 2**: Contains two Node.js applications that depend on multiple backend services such as PostgreSQL, MongoDB, MySQL, and Redis.
     - **Case 3**: Implements a Retrieval-Augmented Generation (RAG) system using **Qdrant**, **Dgraph**, and **PostgreSQL**, with the application built in **Python**.

3. **Docker Compose Configuration**:
   - The project uses Docker Compose to manage multi-container setups, including backend services and application containers.
   - Each test case has its own Compose file, such as `service.yml` for backend services and `app.yml` for application-specific containers.
   - These Compose files provide scalability and easy orchestration of different services, enabling isolated and simultaneous execution of various applications.

4. **Custom Dockerfiles**:
   - Each application (Node.js or Python) has its own Dockerfile for building the application container:
     - For example, `app1.docker`, `app2.docker`, and `app.docker` are custom Dockerfiles for building the containers for different test cases.
   - These Dockerfiles ensure that each application is containerized with the correct dependencies and configuration.

5. **Documentation**:
   - The `docs/` directory contains comprehensive documentation and guidelines for working with Docker and Docker Compose.
   - Key topics include setting up Docker for Node.js apps, using Docker with cloud services, and detailed instructions for initializing various backend containers (e.g., MySQL, PostgreSQL, Qdrant).

6. **Code and Script Examples**:
   - Application source code for different use cases is provided, such as TypeScript files for Node.js apps in `index.ts` (Case 1, Case 2) and Python scripts for the RAG system in `app.py` (Case 3).
   - The source files demonstrate how to interact with backend services, process data, and build APIs using Docker containers.

## Use Cases Supported:

- **Database Management**: Multiple databases are supported, including relational (PostgreSQL, MySQL) and NoSQL (MongoDB, Redis).
- **Vector Search**: Qdrant is used for high-performance vector-based search operations.
- **Graph Relationships**: Dgraph is leveraged to manage and query graph-based relationships.
- **Message Queues**: RabbitMQ provides message brokering capabilities.
- **Cloud Service Integration**: For example, AWS S3 is integrated for storing PostgreSQL backups (Case 1).

This project provides a versatile environment for learning, developing, and deploying complex applications with containerization, offering hands-on experience with different backend systems and Docker technologies.

