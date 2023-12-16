import crypto from 'crypto';
import serverless from 'serverless-http';
import { AppSyncResolverEvent, S3Event } from 'aws-lambda';
import { QldbDriver } from 'amazon-qldb-driver-nodejs';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { HeadObjectCommand, PutObjectTaggingCommand, S3Client } from '@aws-sdk/client-s3';
import { Validator, Schema } from 'jsonschema';
import { Api } from './api';
import { Utils } from './utils';
import { map } from './transformations';
import { Repository } from './db';
import { AppSyncClient } from './appsync-client';
import { GqlResolvers } from './appsync-resolvers';
import { gql } from './appsync-queries';
import { GqlTypes, RegisteredSchemaInfo, S3ObjectInfo, TradeData, Types } from './interfaces';

export const handler = serverless(Api);

export const s3UploadHandler = async (event: S3Event): Promise<Types.StepFnPayload<S3ObjectInfo>> => {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;
  const sfnClient = new SFNClient({ region: process.env.REGION });
  const response = await sfnClient.send(
    new StartExecutionCommand({
      name: Date.now().toString(),
      input: JSON.stringify(event),
      stateMachineArn: process.env.SFN_STM_ARN,
    })
  );
  console.log(JSON.stringify(response, null, 2));
  return { result: 'Succeeded', data: { bucketName, objectKey } };
};

export const registerDataToQldbHandler = async (event: S3Event): Promise<Types.StepFnPayload<S3ObjectInfo>> => {
  const ledgerName = process.env.LEDGER_NAME;
  if (!ledgerName) return { result: 'Failed', failedMessage: 'LEDGER_NAME is not found in env vars' };
  const s3Data = event.Records[0]?.s3;
  if (!s3Data) return { result: 'Failed', failedMessage: 'Event does not contain required s3 info' };

  // Obtain a fingerprint of the data by reading s3 object metadata
  const s3Client = new S3Client({ region: process.env.REGION });
  const bucketName = s3Data.bucket.name;
  const objectKey = s3Data.object.key;
  const s3HeadResponse = await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: objectKey }));

  // Create a fingerprint of the data
  const dateStamp = s3HeadResponse.LastModified ? s3HeadResponse.LastModified.toISOString() : new Date().toISOString();
  const qualifiedName = `${bucketName}/${objectKey}`;
  const hash = crypto.createHash('sha256');
  hash.update(`Size:${s3HeadResponse.ContentLength};`);
  hash.update(`LastModified:${dateStamp};`);
  hash.update(`VersionId:${s3HeadResponse.VersionId};`);
  hash.update(`Name:${qualifiedName};`);
  const fingerprint = hash.digest('hex');

  // Create QLDB table if it doesn't exist
  const driver = new QldbDriver(ledgerName, { region: process.env.REGION });
  const tableName = 'MarketsData';
  await driver.executeLambda(async (txn) => {
    const tables = await txn
      .execute(`SELECT name FROM information_schema.user_tables WHERE name = ?`, tableName)
      .then((cursor) => cursor.getResultList());

    if (tables.length === 0) {
      await txn.execute(`CREATE TABLE ${tableName}`);
      console.log(`Table ${tableName} created successfully`);
    }

    // Insert data into table
    const row: Record<string, unknown> = {
      Id: qualifiedName,
      Fingerprint: fingerprint,
    };
    await txn.execute(`INSERT INTO ${tableName} ?`, row);
  });

  return { result: 'Succeeded', data: { bucketName, objectKey, fingerprint } };
};

export const runAntivirusHandler = async (event: Types.StepFnExecutionResult<S3ObjectInfo>): Promise<Types.StepFnPayload<S3ObjectInfo>> => {
  console.log(event.Payload);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Fake 2 secs for virus scan
  if (event.Payload.data?.objectKey.includes('virus')) return { result: 'Failed', failedMessage: 'Virus detected', data: event.Payload.data };
  return { result: 'Succeeded', data: event.Payload.data };
};

export const validateDataSchemaHandler = async (
  event: Types.StepFnExecutionResult<S3ObjectInfo>
): Promise<Types.StepFnPayload<RegisteredSchemaInfo | S3ObjectInfo>> => {
  const s3Data = event.Payload.data;
  if (!s3Data) return { result: 'Failed', failedMessage: 'Event does not contain required s3 info' };
  const repo = new Repository.RegisteredProviderDataSchemaRepo();

  const s3FileContent = await Utils.S3.getS3ObjectContent(s3Data.bucketName, s3Data.objectKey);
  if (!s3FileContent) return { result: 'Failed', failedMessage: 'S3 file content is empty', data: s3Data };
  const jsonData = JSON.parse(s3FileContent) as TradeData;
  if (!jsonData.metaData) return { result: 'Failed', failedMessage: 'S3 file content is not valid trade data', data: s3Data };

  // Get the schema id from the message metaData
  const item = await repo.getLatestSchema(jsonData.metaData.schemaId);
  if (!item) return { result: 'Failed', failedMessage: `Schema not found for schemaId ${jsonData.metaData.schemaId}`, data: s3Data };

  const registeredSchema = JSON.parse(item.jsonSchema) as Schema;
  const validationResult = new Validator().validate(jsonData, registeredSchema);
  if (!validationResult.valid) {
    console.error(validationResult.errors.toString());
    return { result: 'Failed', failedMessage: `Schema Validation Failed :: ${validationResult.errors.toString()}`, data: s3Data };
  }

  console.log('Data schema validation succeeded');
  return { result: 'Succeeded', data: { ...s3Data, schemaId: item.pk, transformationId: item.transformationId } };
};

export const standardizeAndStoreDataHandler = async (event: Types.StepFnExecutionResult<RegisteredSchemaInfo>): Promise<Types.StepFnPayload> => {
  if (!event.Payload.data) return { result: 'Failed', failedMessage: 'Event does not contain required s3 info' };
  if (!process.env.REGION) return { result: 'Failed', failedMessage: 'REGION is not found in env vars' };
  if (!process.env.APPSYNC_API_URL) return { result: 'Failed', failedMessage: 'APPSYNC_API_URL is not found in env vars' };

  const transformationKey = event.Payload.data.transformationId;
  const transformFn = map.get(transformationKey);
  if (!transformFn) return { result: 'Failed', failedMessage: `Transformation function not found for ${transformationKey}` };

  const s3FileContent = await Utils.S3.getS3ObjectContent(event.Payload.data.bucketName, event.Payload.data.objectKey);
  const parsedData = JSON.parse(s3FileContent) as TradeData;
  const transformedData = transformFn(parsedData.data);
  const transformedDataJson = JSON.stringify(transformedData);
  console.log(transformedDataJson);
  const ledgerId = `${event.Payload.data.bucketName}/${event.Payload.data.objectKey}`;
  const input: GqlTypes.TransformedDataInput<string> = {
    categoryName: parsedData.metaData.categoryName,
    categoryType: parsedData.metaData.categoryType,
    dataType: parsedData.metaData.dataType,
    ledgerId: ledgerId,
    eventDataJson: transformedDataJson,
  };
  const vars = { id: ledgerId, input };
  const response = await AppSyncClient.sendSignedIAMrequest(process.env.APPSYNC_API_URL, process.env.REGION, gql.Mutations.SaveTransformedData, vars);
  if (!response.ok) return { result: 'Failed', failedMessage: `AppSync mutation failed with status code ${response.status}` };
  const responseBody = await response.json();
  console.log(responseBody);
  return { result: 'Succeeded' };
};

export const tagS3ObjectRejectedHandler = async (event: Types.StepFnExecutionResult<S3ObjectInfo>): Promise<Types.StepFnPayload> => {
  console.log(JSON.stringify(event, null, 2));
  if (!event.Payload.data) return { result: 'Failed', failedMessage: 'Event does not contain required s3 info' };
  const s3Client = new S3Client({ region: process.env.REGION });
  const output = await s3Client.send(
    new PutObjectTaggingCommand({
      Bucket: event.Payload.data.bucketName,
      Key: event.Payload.data.objectKey,
      Tagging: {
        TagSet: [
          { Key: 'Status', Value: 'Rejected' },
          { Key: 'StatusReason', Value: event.Payload.failedMessage ?? 'Unknown' },
        ],
      },
    })
  );
  console.log(output);
  if (output.$metadata.httpStatusCode !== 200) {
    const msg = `S3 tagging failed with status code ${output.$metadata.httpStatusCode}`;
    console.error(msg);
    return { result: 'Failed', failedMessage: msg };
  }

  // TODO: Send notification to SES
  return { result: 'Succeeded' };
};

export const appSyncHandler = async (event: AppSyncResolverEvent<unknown, unknown>) => {
  console.log(event);
  const parentTypeName = event.info.parentTypeName;
  const fieldName = event.info.fieldName;
  const args = event.arguments;

  if (parentTypeName === 'Query' || parentTypeName === 'Mutation')
    return await (GqlResolvers as any)[parentTypeName][fieldName].apply(GqlResolvers, [parentTypeName, args]);

  return 'Unknown parent type name, only query, mutation are supported';
};
