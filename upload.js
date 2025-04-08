import express from 'express';
import { config } from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

config();

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET,
  AWS_REGION,
} = process.env;

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const uploadRouter = express.Router();

uploadRouter.post('/get-presigned-url', async (req, res) => {
  const { fileName, fileType } = req.body;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileName,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    const fileUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;

    res.json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

export default uploadRouter;
