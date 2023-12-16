import restana from 'restana';
import bodyParser from 'body-parser';
import { TradeData } from './interfaces';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const Api = restana();
Api.use(bodyParser.json());

Api.get('/', (req, res) => {
  res.send('Welcome to Poc Rest API!');
});

Api.post('/data/markets', async (req, res) => {
  const jsonBody = req.body as unknown as TradeData;
  const s3Response = await new S3Client({ region: process.env.REGION }).send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `${jsonBody.data.dataSupplierCode}/${Date.now()}.json`,
      Body: JSON.stringify(jsonBody, null, 1),
    })
  );
  res.send(s3Response);
});
