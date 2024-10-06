# Guide to Initializing a PostgreSQL Docker Container

This guide walks through the steps required to initialize and configure a PostgreSQL Docker container using a `docker-compose.yml` file. We will define environment variables, manage volumes for data persistence, and connect to the PostgreSQL interactive terminal.

## Step 1: Create the `postgres.env` File

To configure PostgreSQL, we need to define essential environment variables. Create the file `docker/env/postgres.env` with the following variables:

- `POSTGRES_USER`: The username for the PostgreSQL user.
- `POSTGRES_PASSWORD`: The password for the PostgreSQL user.
- `POSTGRES_DB`: The name of the default database to create.

Example content of `docker/env/postgres.env`:

```bash
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydatabase
```

## Step 2: Update `docker-compose.yml`

Your `docker-compose.yml` file should already reference the `postgres.env` file for configuring PostgreSQL. Here is an example configuration:

```yaml
services:
  postgres:
    image: postgres:16.4
    container_name: postgres
    networks:
      - public_net
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../host/postgres:/host
    env_file:
      - ./env/postgres.env
```

Key settings:
- **Environment Variables**: The `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` variables are loaded from the `./env/postgres.env` file.
- **Volumes**: The `postgres_data` volume ensures data persistence by storing the database files outside the container.
- **Networking**: PostgreSQL is exposed on port 5432 and connected to the `public_net` network.

## Step 3: Launch the PostgreSQL Container

Once the configuration is set, you can initialize the PostgreSQL container with the following command:

```bash
docker compose -f docker/compose.yml up postgres
```

This will:
- Start the PostgreSQL container with version `16.4`.
- Expose PostgreSQL on port `5432` to the host.
- Ensure data persistence through the `postgres_data` volume.
- Load the user, password, and database from the `postgres.env` file.

## Step 4: Verify the PostgreSQL Container

To verify that the PostgreSQL container is running, use the following command:

```bash
docker ps
```

This will list the running containers. You should see the `postgres` container in the list.

## Step 5: Access the PostgreSQL Container

To access the PostgreSQL interactive terminal (`psql`), you can use the `docker exec` command. This allows you to connect to the database and run SQL queries.

```bash
docker exec -it postgres psql -U myuser -d mydatabase
```

Replace `myuser` and `mydatabase` with the corresponding values from your `postgres.env` file. This will open the PostgreSQL prompt.

## Step 6: Check Data Persistence

The PostgreSQL container is configured to use the `postgres_data` volume for data persistence. To confirm that data is being stored in the correct directory inside the container, run:

```bash
docker exec -it postgres ls /var/lib/postgresql/data
```

This will show the contents of the PostgreSQL data directory, confirming that data is being persisted.

## Step 7: Attach to the PostgreSQL Container

You can interact with the running PostgreSQL container by attaching to it via `bash` or directly using the `psql` command.

### Option 1: Open a Bash Shell Inside the Container

To open a bash shell inside the PostgreSQL container, run:

```bash
docker exec -it postgres bash
```

Once inside the shell, you can access the PostgreSQL terminal by executing:

```bash
psql -U $POSTGRES_USER -d $POSTGRES_DB
```

Replace `$POSTGRES_USER` and `$POSTGRES_DB` with the actual values from your environment file.

### Option 2: Directly Access the PostgreSQL Terminal

If you prefer not to open a full shell session, you can directly access the PostgreSQL terminal with this command:

```bash
docker exec -it postgres psql -U myuser -d mydatabase
```

### Exiting the Container

To exit the PostgreSQL terminal or the bash shell, simply type:

```bash
exit
```

## Summary

- **Environment Configuration**: PostgreSQL is configured using the `docker/env/postgres.env` file, which defines the user, password, and database.
- **Volume for Data Persistence**: The `postgres_data` volume ensures that PostgreSQL data is retained even when the container is stopped or removed.
- **Networking and Port Mapping**: PostgreSQL is exposed on port `5432` and connected to the `public_net` network.
- **Container Access**: You can access the PostgreSQL container and run SQL commands via `docker exec`.

By following these steps, you can easily set up, initialize, and manage a PostgreSQL container in Docker with data persistence and access control.

