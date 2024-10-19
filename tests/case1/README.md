# Setting Up a Containerized PostgreSQL Backup System with Docker Compose

In this guide, we will walk through how to build a containerized application for **Case 1** (PostgreSQL backup to AWS S3 using Node.js + TypeScript) using Docker Compose. This setup involves:

1. A **Node.js** container that schedules PostgreSQL backups and uploads them to AWS S3.
2. A **PostgreSQL** service from which data is backed up.
3. The **AWS SDK** for interacting with S3, along with a scheduler (e.g., `node-cron` or cron jobs).

## Directory Structure

The directory structure for this setup is as follows:

```
docker_lab/
├── docker/
│   ├── compose.yml
│   ├── env/
│   │   └── postgres.env
│   └── README.md
└── tests/
    └── case1/
        ├── app.yml
        ├── node.docker
        └── src/
            └── index.ts
```

### Step 1: Create the `node.docker` for the Node.js Application

This `node.docker` file will build a Node.js container that runs the TypeScript backup script. Place this file in the `tests/case1/` directory.

**File Path**: `tests/case1/node.docker`

```Dockerfile
# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application
COPY . .

# Install TypeScript globally and compile the TypeScript code
RUN npm install -g typescript && tsc

# Expose the application port (if necessary)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]
```

### Step 2: Write the Backup Script in TypeScript

This script runs a scheduled PostgreSQL backup and uploads it to an S3 bucket using the AWS SDK. The script will be saved in `tests/case1/src/index.ts`.

**File Path**: `tests/case1/src/index.ts`

```typescript
import AWS from 'aws-sdk';
import { exec } from 'child_process';
import cron from 'node-cron';
import * as fs from 'fs';

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const backupAndUpload = () => {
  const backupFile = `/tmp/backup_${new Date().toISOString()}.sql`;

  // Command to backup the PostgreSQL database
  const dumpCommand = `pg_dump -h ${process.env.POSTGRES_HOST} -U ${process.env.POSTGRES_USER} ${process.env.POSTGRES_DB} > ${backupFile}`;
  
  // Execute the backup command
  exec(dumpCommand, (error) => {
    if (error) {
      console.error('Error during PostgreSQL backup:', error);
      return;
    }

    // Read the backup file and upload to S3
    fs.readFile(backupFile, (err, data) => {
      if (err) {
        console.error('Error reading backup file:', err);
        return;
      }

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `backups/${backupFile.split('/').pop()}`, // Filename in S3
        Body: data,
      };

      s3.upload(params, (uploadErr, uploadData) => {
        if (uploadErr) {
          console.error('Error uploading to S3:', uploadErr);
        } else {
          console.log(`Backup successfully uploaded to ${uploadData.Location}`);
        }

        // Clean up: remove local backup file
        fs.unlinkSync(backupFile);
      });
    });
  });
};

// Schedule the backup task (run every day at midnight)
cron.schedule('0 0 * * *', backupAndUpload);

console.log('Scheduled PostgreSQL backups to AWS S3.');
```

### Step 3: Define Environment Variables

In this setup, environment variables are crucial for PostgreSQL and AWS configuration. Place these in the `docker/env/postgres.env` file.

**File Path**: `docker/env/postgres.env`

```bash
POSTGRES_HOST=postgres
POSTGRES_USER=your_user
POSTGRES_DB=your_database
POSTGRES_PASSWORD=your_password

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```

### Step 4: Create the Docker Compose File

Create the `app.yml` file, which defines the PostgreSQL database and the Node.js container for running the backup script. This file should be placed in the `tests/case1/` directory.

**File Path**: `tests/case1/app.yml`

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
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backup_net

  backup-service:
    build:
      context: .
      dockerfile: node.docker
    container_name: backup-service
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_REGION: ${AWS_REGION}
      AWS_BUCKET_NAME: ${AWS_BUCKET_NAME}
    volumes:
      - /tmp:/tmp  # To store temporary backups before uploading
    depends_on:
      - postgres
    networks:
      - backup_net

volumes:
  postgres_data:

networks:
  backup_net:
```

### Step 5: Build and Run the Docker Compose Setup

1. **Navigate to your project directory**:
   ```bash
   cd docker_lab/tests/case1
   ```

2. **Build and start the services**:
   ```bash
   docker-compose -f app.yml up --build
   ```

This will:
- Start a PostgreSQL container.
- Run the Node.js container to back up the PostgreSQL database and upload it to an AWS S3 bucket on a scheduled basis (every day at midnight).

### Conclusion

With this Docker Compose setup, you have created a system to automatically back up your PostgreSQL database and store the backups in an AWS S3 bucket using Node.js, TypeScript, and PostgreSQL. This setup ensures that backups are scheduled and managed securely and efficiently.

