# How to Initialize a MySQL Docker Container for the First Use

When deploying MySQL in a Docker container for the first time, it is important to properly configure the environment to ensure that the root user, database, and necessary users are created automatically. Additionally, using volumes to persist data and SQL initialization scripts can streamline this process. Below is a detailed guide on how to set up a MySQL container in Docker with initial configurations.

## 1. Basic MySQL Setup Using Environment Variables

When you launch a MySQL Docker container, you can pass environment variables to configure critical aspects, such as the root password, database creation, and user setup. MySQL will read these values and apply the configuration during the first startup.

### Key Environment Variables:
- **MYSQL_ROOT_PASSWORD**: Sets the password for the MySQL `root` user.
- **MYSQL_DATABASE**: Creates a new database when the container is first launched.
- **MYSQL_USER** and **MYSQL_PASSWORD**: Create a new non-root user with the specified username and password.

### Example Docker Compose Configuration:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql-container
    ports:
      - "3306:3306"
    networks:
      - backend
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init-scripts:/docker-entrypoint-initdb.d
      - ../host/mysql:/host
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myappdb
      MYSQL_USER: myappuser
      MYSQL_PASSWORD: myapppassword
    #env_file:
    #  - ./env/mysql.env
    restart: always
```

In this example, the MySQL container is configured to:
- Set the root user password as `rootpassword`.
- Create a database called `myappdb`.
- Create a non-root user `myappuser` with the password `myapppassword`.
- Persist data in the `mysql-data` volume and automatically execute initialization scripts.

## 2. Using Initialization Scripts

Docker allows you to initialize the MySQL container with SQL or shell scripts by mounting them into the `/docker-entrypoint-initdb.d` directory. These scripts will automatically run when the container starts for the first time, allowing you to pre-configure the database, create tables, and seed data.

### Example Directory Structure for Initialization Scripts:

```plaintext
docker_lab
├── docker
│   ├── compose.yml
│   └── env
│       └── mysql.env
└── host
    ├── dgraph
    ├── mongodb
    └── mysql
        └── init_scripts
            ├── 001_create_tables.sql  # SQL script for table creation
            └── 002_insert_data.sql    # SQL script for data seeding
```

In this structure, SQL scripts like `001-create-tables.sql` and `002-insert-data.sql` are automatically executed in alphabetical order when the container is first initialized.

### Sample SQL Script for Initialization:

- `001-create-tables.sql`:
  
  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
  );
  ```

- `002-insert_data.sql`:

  ```sql
  INSERT INTO users (username, email) VALUES ('user1', 'user1@example.com');
  ```

These scripts allow MySQL to create tables and seed initial data when the container starts.

## 3. First Login as Root (Bypass Password Authentication)

By default, the MySQL `root` user has access restricted to `localhost`. If you encounter issues with access or need to reset the root password, you can temporarily bypass password authentication using the `--skip-grant-tables` option.

### 3.1 Modify `docker/compose.yml` for Bypassing Authentication

To start MySQL without password authentication, you can modify your `docker/compose.yml` file to include the `command` directive for the MySQL service:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql-container
    ports:
      - "3306:3306"
    networks:
      - backend
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init-scripts:/docker-entrypoint-initdb.d
      - ../host/mysql:/host
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myappdb
      MYSQL_USER: myappuser
      MYSQL_PASSWORD: myapppassword
    #env_file:
    #  - ./env/mysql.env
    restart: always
    command: --skip-grant-tables  # Bypass password checks temporarily
```

### 3.2 Start the MySQL Service

Run the following command to bring up the MySQL service with `--skip-grant-tables`:

```bash
docker compose -f docker/compose.yml up -d
```

### 3.3 Access the MySQL Shell

Once the container is running, access the MySQL shell without needing to enter a password:

```bash
docker exec -it mysql-container mysql
```

### 3.4 Reset the Root Password

After accessing the MySQL shell, update the root password and configure user authentication methods:

```sql
USE mysql;
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root_pwd';
ALTER USER 'myappuser'@'%' IDENTIFIED WITH mysql_native_password BY 'myapppassword';
GRANT ALL PRIVILEGES ON myappdb.* TO 'myappuser'@'%';
FLUSH PRIVILEGES;
```

**Explanation of Commands:**
- `ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root_pwd';`: Changes the authentication method for the `root` user to `mysql_native_password` and sets a new password.
- `ALTER USER 'myappuser'@'%' IDENTIFIED WITH mysql_native_password BY 'myapppassword';`: Changes the authentication method for `myappuser` to `mysql_native_password` and sets a new password.
- `GRANT ALL PRIVILEGES ON myappdb.* TO 'myappuser'@'%';`: Grants all privileges on the `myappdb` database to `myappuser`.
- `FLUSH PRIVILEGES;`: Applies the changes made to the privileges.

### 3.5 Remove `--skip-grant-tables` and Restart

Once the root password is reset and authentication methods are configured, remove the `--skip-grant-tables` line from your `docker/compose.yml`, then restart the MySQL container:

```bash
docker compose -f docker/compose.yml down
docker compose -f docker/compose.yml up -d
```

### 3.6 Login as Root

You should now be able to log in as the `root` user using the new password:

```bash
docker exec -it mysql-container mysql -u root -p
```

Or, log in as the `myappuser` user using the new password:

```bash
docker exec -it mysql-container mysql -u myappuser -p
```

## 4. Accessing MySQL Without SSL

By default, MySQL may require SSL for connections, which can be restrictive in development environments. To allow connections without SSL, you need to adjust the MySQL server's configuration.

### 4.1 Update Docker Compose Configuration

Modify your `docker/compose.yml` to disable SSL by adding the appropriate MySQL configuration. You can achieve this by setting the `MYSQL_ROOT_HOST` environment variable and configuring MySQL to not require SSL.

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql-container
    ports:
      - "3306:3306"
    networks:
      - backend
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init-scripts:/docker-entrypoint-initdb.d
      - ../host/mysql:/host
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myappdb
      MYSQL_USER: myappuser
      MYSQL_PASSWORD: myapppassword
      MYSQL_ROOT_HOST: '%'  # Allow root login from any host
    #env_file:
    #  - ./env/mysql.env
    restart: always
    command: --skip-grant-tables  # Remove this line after resetting passwords
```

### 4.2 Modify MySQL Configuration to Disable SSL

Create a custom MySQL configuration file to disable SSL. For example, create a file named `my.cnf` with the following content:

```ini
[mysqld]
skip_ssl
```

Mount this configuration file into the Docker container by updating the `volumes` section:

```yaml
volumes:
  - mysql-data:/var/lib/mysql
  - ./init-scripts:/docker-entrypoint-initdb.d
  - ./my.cnf:/etc/mysql/conf.d/my.cnf
  - ../host/mysql:/host
```

### 4.3 Restart the MySQL Container

After updating the configuration, restart the MySQL container to apply the changes:

```bash
docker compose -f docker/compose.yml down
docker compose -f docker/compose.yml up -d
```

### 4.4 Verify SSL Configuration

Connect to the MySQL server and verify that SSL is disabled:

```bash
docker exec -it mysql-container mysql -u root -p -e "SHOW VARIABLES LIKE 'have_ssl';"
```

The output should indicate that SSL is disabled:

```
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| have_ssl      | NO    |
+---------------+-------+
```

## 5. Persisting and Managing Data

To ensure data persists across container restarts, use Docker volumes. In the example above, the `mysql-data` volume persists all database data, ensuring that even if the container is stopped or removed, your database remains intact.

## Conclusion

By following this guide, you can easily initialize a MySQL Docker container with essential configurations such as root password setup, database creation, and user management. The use of environment variables and SQL initialization scripts simplifies the process, while Docker volumes ensure that your data persists across container restarts. Additionally, bypassing authentication using `--skip-grant-tables` enables easy password recovery and user management when necessary, and configuring MySQL to allow connections without SSL can facilitate development workflows. This setup is ideal for creating a repeatable and reliable MySQL deployment in Docker.
