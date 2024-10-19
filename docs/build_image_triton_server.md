# Comprehensive Guide: Managing Triton Inference Server with Docker

In this article, we’ll walk through the essential steps for managing your Triton Inference Server using Docker. You'll learn how to customize the `triton.docker` file, build and manage the Docker image, push and pull it from Docker Hub, and finally, integrate it with Docker Compose for efficient container orchestration. Additionally, we'll cover important Docker commands to streamline the process of working with your Triton-based containers.

## Managing the Dockerfile

### Step 1: Managing the `triton.docker` File

Your `triton.docker` file serves as the Dockerfile for setting up the Triton Inference Server, with the flexibility to add any additional configurations or dependencies you might need. Here’s how the Dockerfile is structured:

#### Dockerfile Overview:

- **Base Image**: The file uses `nvcr.io/nvidia/tritonserver:24.08-py3` as the base image, specifically designed for deep learning inference workloads.
- **WORKDIR**: The working directory is set to `/workspace` inside the container.
- **ENV**: Adds TensorRT binaries to the `PATH`.

#### Customizing the Dockerfile:

You can easily modify the `triton.docker` file to suit your specific needs. Here are some common customizations:

1. **Installing Dependencies**:  
   If your application requires additional dependencies, you can add them with the following command:
   ```dockerfile
   RUN apt-get update && apt-get install -y <your-dependencies>
   ```

2. **Copying Files**:  
   To include scripts or configuration files, use the `COPY` directive:
   ```dockerfile
   COPY ./your-script.sh /workspace/your-script.sh
   ```

3. **Exposing Ports**:  
   If your Triton Inference Server needs to expose specific ports, such as HTTP or gRPC endpoints, add the `EXPOSE` directive:
   ```dockerfile
   EXPOSE 8000  # HTTP endpoint
   EXPOSE 8001  # gRPC endpoint
   ```

4. **CMD for Running the Server**:  
   You can specify the command to run Triton directly in the Dockerfile:
   ```dockerfile
   CMD ["tritonserver", "--model-repository=/models"]
   ```

### Step 2: Building the Docker Image

Once your `triton.docker` file is set up, the next step is to build the Docker image. If the file is named `triton.docker`, you can rename it to `Dockerfile` or specify it using the `-f` option while building the image.

```bash
docker build -f triton.docker -t 24.08-py3 .
```

- This command builds the Docker image and tags it as `24.08-py3`.

### Step 3: Pushing the Docker Image to Docker Hub

After building your image, you can push it to Docker Hub for sharing or deployment.

#### Step A: Login to Docker Hub

First, log in to Docker Hub using your credentials:

```bash
docker login
```

#### Step B: Tag the Docker Image

Tag your image to prepare it for pushing to Docker Hub. The format is `dockerhub-username/repository-name:tag`. For example:

```bash
docker tag 24.08-py3 ksmooi/nvidia-tritonserver:24.08-py3
```

#### Step C: Push the Image

Now, push the image to Docker Hub:

```bash
docker push ksmooi/nvidia-tritonserver:24.08-py3
```

The image is now available on Docker Hub under the repository `ksmooi/triton-server`.

### Step 4: Pulling the Docker Image from Docker Hub

To pull the image from Docker Hub, simply run:

```bash
docker pull ksmooi/nvidia-tritonserver:24.08-py3
```

This command pulls the `24.08-py3` version of your Triton server image.

### Step 5: Docker Compose with Triton Inference Server

Docker Compose is a great tool for managing multi-container applications. Here’s how to configure `compose.yml` to run Triton alongside other services like databases:

```yaml
version: "3.8"
services:
  triton:
    image: ksmooi/nvidia-tritonserver:24.08-py3
    container_name: triton_server
    ports:
      - "8000:8000"  # HTTP endpoint
      - "8001:8001"  # gRPC endpoint
    environment:
      - MODEL_REPOSITORY=/models
    volumes:
      - ./models:/models  # Mount your models directory
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              capabilities: [gpu]  # Ensure GPU access
    runtime: nvidia  # Use NVIDIA runtime for GPU access
```

To start the Triton server along with other services defined in the `compose.yml` file, run:

```bash
docker compose up
```

This command brings up the Triton server with the necessary configurations.


## Key Docker Commands for Managing Triton Server

Here are some useful Docker commands for managing the Triton Inference Server image and container.

### 1. **Run the Triton Container with Port Mapping**

```bash
docker run -d -p 8000:8000 -p 8001:8001 --name triton ksmooi/nvidia-tritonserver:24.08-py3
```

- `-d`: Runs the container in detached mode.
- `-p`: Maps the container ports (8000, 8001) to the host machine.
- `--name`: Assigns the name `triton` to the running container.

### 2. **Run with a Mounted Model Repository**

```bash
docker run -d -p 8000:8000 -p 8001:8001 --name triton -v /path/to/your/models:/models ksmooi/nvidia-tritonserver:24.08-py3
```

- `-v`: Mounts the local directory `/path/to/your/models` to `/models` in the container.

### 3. **Run the Triton Server with GPU Support**

```bash
docker run --gpus all -d -p 8000:8000 -p 8001:8001 --name triton -v /path/to/your/models:/models ksmooi/nvidia-tritonserver:24.08-py3
```

- `--gpus all`: Grants access to all GPUs on the host machine.

### 4. **List Running Containers**

```bash
docker ps
```

Displays a list of all running containers, including their names, IDs, and port mappings.

### 5. **Inspect a Running Container**

```bash
docker inspect triton
```

This shows detailed information about the container, including its network, environment variables, and more.

### 6. **Access the Container Shell**

```bash
docker exec -it triton /bin/bash
```

This command gives you access to the shell inside the running container, useful for debugging or manual commands.

### 7. **Stop the Triton Container**

```bash
docker stop triton
```

Gracefully stops the running container.

### 8. **Restart a Stopped Container**

```bash
docker start triton
```

Restarts a previously stopped container.

### 9. **Remove a Stopped Container**

```bash
docker rm triton
```

Removes the stopped container from your system.

### 10. **View Container Logs**

```bash
docker logs triton
```

Shows logs from the running container. Add `-f` to follow logs in real time:

```bash
docker logs -f triton
```

### 11. **Run a Container with Environment Variables**

```bash
docker run -d -p 8000:8000 -p 8001:8001 --name triton -e MODEL_REPOSITORY=/models ksmooi/nvidia-tritonserver:24.08-py3
```

- `-e`: Sets environment variables for the container.

### 12. **Automatically Remove a Container After Stopping**

```bash
docker run --rm -d -p 8000:8000 -p 8001:8001 --name triton ksmooi/nvidia-tritonserver:24.08-py3
```

This command ensures the container is cleaned up once it stops.


## Additional Tips

### Resource Management

You can limit CPU and memory usage for your container using the following flags:

```bash
docker run -d -p 8000:8000 -p 8001:8001 --name triton --memory="4g" --cpus="2" ksmooi/nvidia-tritonserver:24.08-py3
```

- `--memory`: Limits the container to 4GB of RAM.
- `--cpus`: Limits the container to 2 CPU cores.

### Detached Mode with Interaction

To attach to a running container’s terminal, use:

```bash
docker attach triton
```

Detach again using `CTRL+P` followed by `CTRL+Q`.


## Quick Reference: Essential Docker Commands

1. **Build an image**:  
   `docker build -t <image-name> .`

2. **Run a container**:  
   `docker run -d -p <host-port>:<container-port> <image-name>`

3. **List running containers**:  
   `docker ps`

4. **Stop a container**:  
   `docker stop <container-name>`

5. **View container logs**:  
   `docker logs <container-name>`

6. **Remove a container**:  
   `docker rm <container-name>`

7. **List Docker Images**:  
   `docker images`

8. **Remove a Docker Image**:  
   `docker rmi <repository>` or `docker rmi <image-id>`

---

By following this guide, you now have a complete understanding of how to manage Triton Inference Server with Docker, including how to build, push, and pull images, run containers, and manage them with Docker Compose. With these tools, you're set to deploy scalable, efficient deep learning inference workloads!

 