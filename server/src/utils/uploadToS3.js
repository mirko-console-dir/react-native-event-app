import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from 'crypto'
import dotenv from 'dotenv';
import sharp from 'sharp'
import pMap from 'p-map'; //node library passsing concurrently param It controls how many promises can be executed concurrently.

dotenv.config();

const randomNameImage = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessS3Key = process.env.ACCESS_S3_KEY;
const secretAccessS3Key = process.env.SECRET_ACCESS_S3_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessS3Key,
    secretAccessKey: secretAccessS3Key
  },
  region: bucketRegion
});

const uploadToS3 = async (images) => {
  try {
    const uploadedImages = await pMap(
      images,
      async (image, index) => {
        const { data, contentType, caption, originalFileName } = image;

        const bufferClient = Buffer.from(data);

        const buffer = await sharp(bufferClient)
          .resize({ height: 1980, width: 1080, fit: 'contain' })
          .toFormat('png') // Convert to png format
          .png({ quality: 80 })
          .toBuffer()

        const imageName = randomNameImage();

        const s3Params = {
          Bucket: bucketName,
          Key: imageName,
          Body: buffer,
          ContentType: contentType,
        };

        const uploadCommand = new PutObjectCommand(s3Params);
        await s3.send(uploadCommand);

        return {
          caption,
          imageName
        };
      },
      { concurrency: 5 } // Adjust concurrency based on your requirements
    );

    return uploadedImages;

  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw new Error('Error uploading image to S3');
  }
};

export default uploadToS3;
