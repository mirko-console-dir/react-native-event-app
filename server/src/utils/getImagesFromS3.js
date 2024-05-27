import { S3Client,GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
import pMap from 'p-map'; //node library passsing concurrently param It controls how many promises can be executed concurrently.

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

const getImagesFromS3 = async (images) => {
  try {
    const uploadedImages = await pMap(
      images,
      async (image, index) => {
        const { imageName } = image;

        const getObjectParams = { 
          Bucket: bucketName,
          Key: imageName,
        };

        const command = new GetObjectCommand(getObjectParams);
        const expiresInOneDay = 24 * 60 * 60;
        
        const url = await getSignedUrl(s3, command, {expiresIn: expiresInOneDay});
        const id = image.id
        return {
            id,
            imageName,
            url
        };
      },
      { concurrency: 5 } // max 5 
    );

    return uploadedImages;

  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw new Error('Error uploading image to S3');
  }
};

export default getImagesFromS3;
