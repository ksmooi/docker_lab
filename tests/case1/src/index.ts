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
