import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PocStackProps } from "./interface";
import { ApiGwRestApi } from "./custom-constructs/apigw-rest-api";
import { S3AutoDeleteBucket } from "./custom-constructs/s3-auto-del-bucket";
import { StepFnLambdas } from "./custom-constructs/sfn-lambdas";
import { Lambdas } from "./utils/lambdas";
import { IAM } from "./utils/iam";
import { DynamoOpStore } from "./custom-constructs/dynamo-op-store";
import { AppSyncGqlApi } from "./custom-constructs/appsync-gql-api";
import { CognitoUserPool } from "./custom-constructs/cognito-userpool";
import { S3StaticSites } from "./custom-constructs/s3-static-sites";

export class PocInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PocStackProps) {
    super(scope, id, props);

    const s3RecBucketName = `${props.appName}-${props.stackShortName}-record-datastore1`;
    const s3Records = new S3AutoDeleteBucket(this, "RecordDataS31", { ...props, bucketName: s3RecBucketName });

    const baseVars = { REGION: props.defaultRegion };

    // Create QLDB Ledger
    const ledgerDb = new cdk.aws_qldb.CfnLedger(this, "Ledger", {
      permissionsMode: "STANDARD",
      name: `${props.appName}-${props.stackShortName}-qldb-ledger`,
      deletionProtection: false,
    });

    // Create operational dynamoDB datastore
    const tableName = `${props.appName}-${props.stackShortName}-operational-store`;
    const opDynamoStore = new DynamoOpStore(this, "Store", { tableName: tableName });

    // Create Cognito User pool
    const cognitoUserPool = new CognitoUserPool(this, "CognitoAuth", {
      ...props,
      poolName: `${props.appName}-${props.stackShortName}-user-pool`,
    });

    // Create AppSync GraphQL API
    const appSync = new AppSyncGqlApi(this, "AppSyncGqlApi", {
      ...props,
      apiName: "clients-gql-api",
      userPoolRegion: cognitoUserPool.userPool.env.region,
      userPoolId: cognitoUserPool.userPool.userPoolId,
      environmentVars: { ...baseVars, TABLE_NAME: tableName },
    });

    const lambdaQldbProps = { ...baseVars, LEDGER_NAME: ledgerDb.name! };
    const lambdaRegisterToQldb = Lambdas.createRegisterToQldb(this, props, lambdaQldbProps);
    const lambdaRunAntivirus = Lambdas.createRunAntivirus(this, props, baseVars);
    const lambdaSchemaValidate = Lambdas.createSchemaValidate(this, props, { ...baseVars, TABLE_NAME: tableName });
    const lambdaTagRejectedData = Lambdas.createTagRejectedData(this, props, baseVars);
    const lambdaStdStoreData = Lambdas.createStdStoreData(this, props, {
      ...baseVars,
      APPSYNC_API_URL: appSync.graphqlApi.attrGraphQlUrl,
    });

    lambdaStdStoreData.node.addDependency(appSync.graphqlApi);
    lambdaRegisterToQldb.node.addDependency(ledgerDb);

    // Step Functions for SoR and data ETL
    const stepFn = new StepFnLambdas(this, "IngestionStepFn", {
      ...props,
      registerToQldbLambda: lambdaRegisterToQldb,
      runAntivirusLambda: lambdaRunAntivirus,
      validateDataSchemaLambda: lambdaSchemaValidate,
      standardizeAndStoreDataLambda: lambdaStdStoreData,
      tagRejectedDataLambda: lambdaTagRejectedData,
    });

    // Lambda that receives notification when a new object is put into S3. This will also start the step functions
    const lambdaS3RecordVars = { REGION: props.defaultRegion, SFN_STM_ARN: stepFn.stateMachine.stateMachineArn };
    const lambdaS3RecordUpload = Lambdas.createS3RecordUpload(this, props, lambdaS3RecordVars);
    lambdaS3RecordUpload.node.addDependency(stepFn.stateMachine);

    // Create lambda to server as a RESTFul API for providers to post data
    const lambdaRestApi = Lambdas.createRestApi(this, props, { ...baseVars, S3_BUCKET: s3RecBucketName });

    // Create a Rest API Gateway
    new ApiGwRestApi(this, "ApiGw", { ...props, function: lambdaRestApi.function });

    // Create Frontend SPA S3 buckets and CloudFront distribution
    new S3StaticSites(this, "Frontend", { ...props });

    // Access Control
    lambdaRegisterToQldb.function.addToRolePolicy(IAM.policyStatements.qldbTablesReaderWriter(ledgerDb.name!));
    lambdaRegisterToQldb.function.addToRolePolicy(IAM.policyStatements.qldbInfoSchemaReader(ledgerDb.name!));
    lambdaStdStoreData.function.addToRolePolicy(IAM.policyStatements.lambdaInvokeAppSync(appSync.graphqlApi.attrApiId));
    stepFn.stateMachine.grantStartExecution(lambdaS3RecordUpload.function);
    s3Records.s3Bucket.grantWrite(lambdaRestApi.function);
    s3Records.s3Bucket.grantRead(lambdaS3RecordUpload.function);
    s3Records.s3Bucket.grantRead(lambdaRegisterToQldb.function);
    s3Records.s3Bucket.grantRead(lambdaSchemaValidate.function);
    s3Records.s3Bucket.grantRead(lambdaStdStoreData.function);
    s3Records.s3Bucket.grantPut(lambdaTagRejectedData.function); // Todo: make this more fine grained to only allow the lambda to tag the object
    opDynamoStore.dynamoDbTable.grantReadData(lambdaSchemaValidate.function);
    opDynamoStore.dynamoDbTable.grantReadWriteData(lambdaStdStoreData.function);
    opDynamoStore.dynamoDbTable.grantReadWriteData(appSync.lambdaResolvers.function);

    // Notifications
    s3Records.s3Bucket.addObjectCreatedNotification(
      new cdk.aws_s3_notifications.LambdaDestination(lambdaS3RecordUpload.function)
    );
  }
}
