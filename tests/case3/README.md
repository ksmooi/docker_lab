# Building a Containerized Application for RAG System (Qdrant, Dgraph, PostgreSQL)

To build a containerized application for **Case 3** (a **Retrieval-Augmented Generation (RAG) System** using **Qdrant**, **Dgraph**, and **PostgreSQL**), the solution consists of the following components:

1. **Backend services** (Qdrant, Dgraph, PostgreSQL) defined in the `service.yml` Docker Compose file.
2. **Application container** for running the Langchain + Python app, defined in `app.yml`.
3. Environment files (`dgraph.env`, `postgres.env`, `qdrant.env`) to configure each backend service.

Let's proceed with the design based on the provided directory structure.

## Directory Structure

```
docker_lab/
└── tests/
    └── case3/
        ├── app/
        │   ├── app.docker       # Dockerfile for Langchain + Python app
        │   └── src/
        │       └── app.py       # Python script to run the application
        ├── env/
        │   ├── dgraph.env       # Environment variables for Dgraph
        │   ├── postgres.env     # Environment variables for PostgreSQL
        │   └── qdrant.env       # Environment variables for Qdrant
        ├── app.yml              # Docker Compose for the app container
        └── service.yml          # Docker Compose for backend services (Qdrant, Dgraph, PostgreSQL)
```

## Step 1: Backend Services (`service.yml`)

This file defines the backend services: **Qdrant**, **Dgraph**, and **PostgreSQL**.

**File Path**: `tests/case3/service.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16.4
    container_name: postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    env_file:
      - ./env/postgres.env
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rag_net

  dgraph:
    image: dgraph/standalone:v24.0.2
    container_name: dgraph
    env_file:
      - ./env/dgraph.env
    ports:
      - "8080:8080"  # Dgraph HTTP
      - "9080:9080"  # Dgraph Alpha
    volumes:
      - dgraph_data:/dgraph
    networks:
      - rag_net

  qdrant:
    image: qdrant/qdrant:v1.11.3
    container_name: qdrant
    env_file:
      - ./env/qdrant.env
    ports:
      - "6333:6333"  # Qdrant API
      - "6334:6334"  # Qdrant internal communication
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - rag_net

volumes:
  postgres_data:
  dgraph_data:
  qdrant_data:

networks:
  rag_net:
    driver: bridge
```

## Explanation:
- **PostgreSQL** stores relational data and connects on port `5432`.
- **Dgraph** handles graph-based data relationships and is accessible via ports `8080` (Ratel UI) and `9080` (Alpha service).
- **Qdrant** provides vector-based search, running on ports `6333` (API) and `6334` (internal).
- All services are connected via the same `rag_net` Docker network.

## Step 2: Application Service (`app.yml`)

The `app.yml` file defines the Langchain + Python application that interacts with the backend services using gRPC.

**File Path**: `tests/case3/app.yml`

```yaml
version: '3.8'

services:
  app:
    build:
      context: ./app
      dockerfile: app.docker
    container_name: rag-app
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}

      DGRAPH_HOST: dgraph
      DGRAPH_PORT: 9080

      QDRANT_HOST: qdrant
      QDRANT_PORT: 6333
    ports:
      - "50051:50051"  # gRPC API
    depends_on:
      - postgres
      - dgraph
      - qdrant
    networks:
      - rag_net

networks:
  rag_net:
    external: true
```

## Explanation:
- **App Container**: Builds the Langchain + Python application using `app.docker`.
- **Ports**: Exposes port `50051` for gRPC API communication.
- **Environment Variables**: Specifies connection details for PostgreSQL, Dgraph, and Qdrant.
- **Network**: Shares the same `rag_net` network with the backend services to enable seamless communication.

## Step 3: Environment Configuration

Create environment files for each service to define variables like usernames, passwords, and ports.

### `dgraph.env`

**File Path**: `tests/case3/env/dgraph.env`

```bash
DGRAPH_URL=http://dgraph:9080
DGRAPH_LOG_LEVEL=INFO
```

### `postgres.env`

**File Path**: `tests/case3/env/postgres.env`

```bash
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydatabase
```

### `qdrant.env`

**File Path**: `tests/case3/env/qdrant.env`

```bash
QDRANT__SERVICE__HTTP_PORT=6333
QDRANT__SERVICE__GRPC_PORT=6334
QDRANT__LOG_LEVEL=INFO
```

## Step 4: Dockerfile for Langchain + Python Application

The `app.docker` file builds the application container that runs the Langchain + Python application.

**File Path**: `tests/case3/app/app.docker`

```Dockerfile
# Use an official Python runtime as a base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source code
COPY ./src ./src

# Expose the gRPC port
EXPOSE 50051

# Command to run the Python gRPC server
CMD ["python", "src/app.py"]
```

## Step 5: Application Code (`app.py`)

Here is a basic example of the Python application that integrates Langchain with gRPC and communicates with the backend services.

**File Path**: `tests/case3/app/src/app.py`

```python
import grpc
from concurrent import futures
import time

# Import your gRPC service and messages
import your_grpc_service_pb2_grpc as pb2_grpc
import your_grpc_service_pb2 as pb2

# Service implementation
class RAGService(pb2_grpc.RAGServiceServicer):
    def __init__(self):
        # Initialize connections to Qdrant, Dgraph, and PostgreSQL
        self.qdrant_host = 'qdrant'
        self.dgraph_host = 'dgraph'
        self.postgres_host = 'postgres'
        # Add connection logic here...

    # Define your gRPC methods here...
    def GetRAGData(self, request, context):
        # Logic to interact with Qdrant, Dgraph, and PostgreSQL
        return pb2.RAGResponse(message='Retrieved and generated data')

# gRPC server setup
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_RAGServiceServicer_to_server(RAGService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("gRPC server started on port 50051.")
    try:
        while True:
            time.sleep(86400)  # Run server forever
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
```

## Step 6: Build and Run the Application

1. **Navigate to the directory**:
   ```bash
   cd docker_lab/tests/case3
   ```

2. **Start backend services**:
   ```bash
   docker-compose -f service.yml up -d
   ```

3. **Build and start the application**:
   ```bash
   docker-compose -f app.yml up --build
   ```

This will:
- Spin up **PostgreSQL**, **Dgraph**, and **Qdrant** containers.
- Build the **Langchain + Python** app container, exposing the gRPC API on port `50051`.



## Number of Docker Containers Running

In total, there are **four containers** running in this setup:

1. **PostgreSQL Container**
   - This container runs a PostgreSQL database, which handles relational data.
   - Image: `postgres:16.4`
   - Exposed Port: `5432`

2. **Dgraph Container**
   - This container runs Dgraph, which manages graph-based data and relationships.
   - Image: `dgraph/standalone:v24.0.2`
   - Exposed Ports: `8080` (Ratel UI), `9080` (Alpha Service)

3. **Qdrant Container**
   - This container runs Qdrant, which is responsible for vector-based searches.
   - Image: `qdrant/qdrant:v1.11.3`
   - Exposed Ports: `6333` (Qdrant API), `6334` (Internal Communication)

4. **Application (RAG System) Container**
   - This container runs the Python-based Langchain application, which connects to the backend services (PostgreSQL, Dgraph, Qdrant) to retrieve and generate data. It serves a gRPC API for client interaction.
   - Custom-built using the Dockerfile `app.docker`.
   - Exposed Port: `50051` (gRPC API)

## Networking Between the Containers

All the containers are connected to the same Docker network (`rag_net`), a custom bridge network defined in the Docker Compose files. The bridge network allows the containers to communicate with each other internally by using service names rather than IP addresses. Here’s how the networking works:

### 1. **Docker Network (`rag_net`)**
   - All containers share the same bridge network (`rag_net`). This enables the containers to communicate seamlessly using their service names (`postgres`, `dgraph`, `qdrant`, and `rag-app`).

### 2. **Internal Communication Using Service Names**
   - **PostgreSQL** can be accessed from the application container using the service name `postgres` and port `5432`. For example:
     ```bash
     POSTGRES_HOST=postgres
     POSTGRES_PORT=5432
     ```
   - **Dgraph** is accessible from the application via the service name `dgraph` and port `9080` (for Alpha Service) or `8080` (for Ratel UI). For example:
     ```bash
     DGRAPH_HOST=dgraph
     DGRAPH_PORT=9080
     ```
   - **Qdrant** is accessible using the service name `qdrant` and port `6333` (API) or `6334` (for internal communication). For example:
     ```bash
     QDRANT_HOST=qdrant
     QDRANT_PORT=6333
     ```

### 3. **External Access via Exposed Ports**
   - Some containers expose ports to allow access from outside the Docker network:
     - **PostgreSQL** exposes port `5432` for external access.
     - **Dgraph** exposes ports `8080` (Ratel UI) and `9080` (Alpha Service).
     - **Qdrant** exposes ports `6333` (API) and `6334` (internal communication).
     - **RAG System Application** exposes port `50051` for gRPC-based API interactions.

### 4. **gRPC API Communication**
   - The application container exposes its gRPC API on port `50051`. Clients (e.g., external applications or users) can send gRPC requests to the application using this port. Internally, the application communicates with **PostgreSQL**, **Dgraph**, and **Qdrant** over the `rag_net` network using their respective service names.

## How Networking Works:

1. **Internal Communication**: All services can reach each other over the internal Docker network `rag_net` by referring to their service names. This removes the need for hardcoding IP addresses and simplifies service discovery within the Docker environment.
   
   Example:
   - The application can connect to the PostgreSQL service by referring to it as `postgres` within the network:
     ```python
     pg_host = 'postgres'
     pg_port = 5432
     ```

2. **External Communication**: Some containers (e.g., PostgreSQL, Dgraph, Qdrant) expose ports for access outside of Docker. This allows external clients to interact with the services if needed. For instance, Dgraph’s Ratel UI can be accessed at `http://localhost:8080`, and the gRPC API can be accessed at `localhost:50051`.

3. **Service Dependencies**: The `depends_on` directive in the Docker Compose files ensures that the application container starts only after the required services (PostgreSQL, Dgraph, Qdrant) are up and running. This ensures the application has all the necessary backend services available when it initializes.


## Conclusion

In this setup, we’ve created a containerized **Retrieval-Augmented Generation (RAG) System** using **Qdrant** for vector-based search, **Dgraph** for graph-based relationships, and **PostgreSQL** for relational data. The backend services run in separate containers and are orchestrated via `service.yml`, while the Langchain + Python app runs in its own container, defined in `app.yml`.

This architecture ensures modularity, scalability, and ease of development, with each component interacting over a shared Docker network (`rag_net`). The app communicates with the backend via gRPC for fast, efficient communication.
