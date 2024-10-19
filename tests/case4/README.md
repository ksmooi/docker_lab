# Building a Containerized Agentic AI System Using Docker Compose

In this article, we will design and build a **containerized Agentic AI system** using Docker Compose. The system will rely on multiple backend services, such as PostgreSQL, MongoDB, Qdrant, Redis, and RabbitMQ, and a Python application built with essential AI libraries like `langchain`, `openai`, `transformers`, and more.

### Overview of the System

- **App Stack**: Python application using libraries like `langchain`, `transformers`, and `faiss-cpu`.
- **Backend Services**: PostgreSQL, MongoDB, Qdrant, Redis, RabbitMQ.
- **API**: Built using **gRPC** for high performance and fast communication.
- **UI**: A combination of **FastAPI** for the API and **Streamlit** for the user interface.

This system is designed to use **Docker Compose V2**, ensuring that all components can communicate effectively via Docker's networking features. The system will consist of multiple containers running different services and applications, ensuring modularity and scalability.



## System Architecture

The system is divided into two main parts:

1. **Backend Services**: Managed by Docker Compose (`service.yml`), providing essential services such as databases and message brokers.
2. **Python Application**: Defined in its own Docker Compose file (`app.yml`) and linked to the backend services for data management and AI functionality.

### Directory Structure

```bash
tests
└── case4
    ├── app
    │   ├── app.docker               # Dockerfile for the Python application
    │   └── src
    │       └── app.py               # Python application code
    ├── service.yml                  # Docker Compose for backend services
    ├── app.yml                      # Docker Compose for the Python application
    └── env                          # Environment files for services
        ├── dgraph.env
        ├── postgres.env
        └── qdrant.env
```



## Step 1: Backend Services Definition (`service.yml`)

The `service.yml` file will define the backend services, including PostgreSQL, MongoDB, Qdrant, Redis, and RabbitMQ. Each service runs in its own container, providing essential functionalities like data storage, message queuing, and vector search.

```yaml
services:
  postgresql:
    image: postgres:16.4
    container_name: postgresql
    environment:
      POSTGRES_USER: ai_user
      POSTGRES_PASSWORD: ai_password
      POSTGRES_DB: ai_db
    ports:
      - "5432:5432"
    volumes:
      - postgresql_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6.0
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  qdrant:
    image: qdrant/qdrant:v1.11.3
    container_name: qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

  redis:
    image: redis:7.4.0
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3.13.7-management
    container_name: rabbitmq
    ports:
      - "5672:5672"    # Messaging port
      - "15672:15672"  # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  postgresql_data:
  mongodb_data:
  qdrant_data:
  redis_data:
  rabbitmq_data:
```

### Explanation

- **PostgreSQL**: Stores relational data, accessible on port `5432`.
- **MongoDB**: NoSQL database for document-based storage, available on port `27017`.
- **Qdrant**: Vector database for handling vector-based searches, exposed on ports `6333` (API) and `6334` (internal communication).
- **Redis**: In-memory data store used for caching, message brokering, and session management, available on port `6379`.
- **RabbitMQ**: Message broker for handling asynchronous communication between services, with a messaging port `5672` and a management UI on `15672`.

All services are configured with **persistent storage** using Docker volumes, ensuring data remains even if the containers are restarted.



## Step 2: Python Application Definition

### Dockerfile (`app.docker`)

The Python application will be built using a custom Dockerfile (`app.docker`). This Dockerfile installs all necessary dependencies and sets up the environment for running a Python-based AI system.

```Dockerfile
# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /usr/src/app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ .

# Expose necessary ports for FastAPI and Streamlit
EXPOSE 8000  # FastAPI API
EXPOSE 8501  # Streamlit UI

# Command to start FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Python Dependencies (`requirements.txt`)

```text
langchain
openai
transformers
sentence-transformers
faiss-cpu
pinecone-client
chromadb
pandas
numpy
sqlalchemy
python-dotenv
fastapi
uvicorn
streamlit
requests
tqdm
```

### Application Code (`src/app.py`)

This is a simple Python application that serves an API using **FastAPI** and a user interface using **Streamlit**.

```python
from fastapi import FastAPI
import streamlit as st

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Agentic AI System is up and running!"}

def run_streamlit():
    st.title("Agentic AI Interface")
    st.write("This is the main interface for interacting with the AI system.")
    # Add Streamlit UI code here

if __name__ == "__main__":
    import threading
    threading.Thread(target=run_streamlit).start()
```

This application:
- **FastAPI**: Runs an API to interact with the backend services.
- **Streamlit**: Provides a UI to visualize or interact with the data.



## Step 3: Application Compose File (`app.yml`)

The `app.yml` defines the Python application's container and links it to the backend services defined in `service.yml`.

```yaml
services:
  agentic-ai:
    build:
      context: .
      dockerfile: app.docker
    container_name: agentic-ai
    environment:
      POSTGRES_HOST: postgresql
      POSTGRES_USER: ai_user
      POSTGRES_PASSWORD: ai_password
      POSTGRES_DB: ai_db
      MONGO_URI: mongodb://mongodb:27017
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672/
      QDRANT_HOST: qdrant
      QDRANT_PORT: 6333
    depends_on:
      - postgresql
      - mongodb
      - qdrant
      - redis
      - rabbitmq
    ports:
      - "8000:8000"  # FastAPI
      - "8501:8501"  # Streamlit
    networks:
      - ai_net

networks:
  ai_net:
    external: true
```

### Explanation

- The `agentic-ai` service is linked to all backend services through environment variables.
- The **`depends_on`** directive ensures that the backend services are up before the Python application starts.
- Ports `8000` (for FastAPI) and `8501` (for Streamlit) are exposed for API and UI access.
- All services are connected via a shared **Docker network (`ai_net`)**, allowing internal communication between containers.



## Step 4: Running the Containers

To build and run the entire system, follow these steps:

1. **Start the backend services**:
   ```bash
   cd tests/case4
   docker-compose -f service.yml up -d
   ```

2. **Start the Python application**:
   ```bash
   docker-compose -f app.yml up --build
   ```

These commands will:
- Launch all backend services (PostgreSQL, MongoDB, Qdrant, Redis, RabbitMQ).
- Build and run the Python application, exposing FastAPI and Streamlit interfaces.



## Step 5: Access the Application

- **FastAPI** API: Accessible at `http://localhost:8000`.
- **Streamlit** UI: Accessible at `http://localhost:8501`.



## Conclusion

This containerized setup for the **Agentic AI system** ensures modularity, scalability, and efficient communication between different components. By using Docker Compose V2, we create a seamless environment where all services (databases, message brokers, vector search engines) are linked to the main Python application, providing a comprehensive system for AI-related tasks.

With this design, you can build, test, and scale your Agentic AI application efficiently in a containerized environment.
