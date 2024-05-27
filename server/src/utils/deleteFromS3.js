import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config();


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

const deleteFromS3 = async (imageName) => {
  try {

    const params = {
        Bucket: bucketName,
        Key: imageName,
    }
    const command = new DeleteObjectCommand(params);
    await s3.send(command)
    return
  } catch (error) {
    console.error('Error Delete image to S3:', error);
    throw new Error('Error Delete image to S3');
  }
};

export default deleteFromS3;
