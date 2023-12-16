import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const Utils = {
  S3: {
    getS3ObjectContent: async (bucketName: string, objectKey: string): Promise<string> => {
      const client = new S3Client({ region: process.env.REGION });
      const s3Response = await client.send(new GetObjectCommand({ Bucket: bucketName, Key: objectKey }));
      const data = await s3Response.Body?.transformToString('utf-8');
      return data ?? '';
    },
  },
};
