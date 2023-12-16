import { Construct } from "constructs";
import { LambdaBasic } from "../custom-constructs/lambda-basic";
import { PocStackProps } from "../interface";

export const Lambdas = {
  createRestApi: (scope: Construct, props: PocStackProps, environmentVars?: Record<string, string>) =>
    new LambdaBasic(scope, "ApiServerLambda", {
      ...props,
      funcName: `${props.appName}-${props.stackShortName}-api-server`,
      envVars: { ...environmentVars },
    }),
  createS3RecordUpload: (scope: Construct, props: PocStackProps, environmentVars?: Record<string, string>) =>
    new LambdaBasic(scope, "S3RecordsLambda", {
      ...props,
      funcName: `${props.appName}-${props.stackShortName}-s3-record-upload`,
      envVars: { ...environmentVars },
    }),
  createRegisterToQldb: (scope: Construct, props: PocStackProps, environmentVars?: Record<string, string>) =>
    new LambdaBasic(scope, "RegisterDataLambda", {
      ...props,
      funcName: `${props.appName}-${props.stackShortName}-register-data`,
      envVars: { ...environmentVars },
    }),
  createRunAntivirus: (scope: Construct, props: PocStackProps, environmentVars?: Record<string, string>) =>
    new LambdaBasic(scope, "RunAntivirusLambda", {
      ...props,
      funcName: `${props.appName}-${props.stackShortName}-run-antivirus`,
      envVars: { ...environmentVars },
    }),
  createSchemaValidate: (scope: Construct, props: PocStackProps, environmentVars?: Record<string, string>) =>
    new LambdaBasic(scope, "ValidateDataLambda", {
      ...props,
      funcName: `${props.appName}-${props.stackShortName}-validate-data`,
      envVars: { ...environmentVars },
    }),
  createStdStoreData: (scope: Construct, props: PocStackProps, environmentVars?: Record<string, string>) =>
    new LambdaBasic(scope, "StandardizeDataLambda", {
      ...props,
      funcName: `${props.appName}-${props.stackShortName}-standardize-data`,
      envVars: { ...environmentVars },
    }),
  createTagRejectedData: (scope: Construct, props: PocStackProps, environmentVars?: Record<string, string>) =>
    new LambdaBasic(scope, "TagRejectedDataLambda", {
      ...props,
      funcName: `${props.appName}-${props.stackShortName}-tag-rejected-data`,
      envVars: { ...environmentVars },
    }),
  createAppSyncGqlApi: (scope: Construct, props: PocStackProps, environmentVars?: Record<string, string>) =>
    new LambdaBasic(scope, "AppSyncGqlApiLambda", {
      ...props,
      funcName: `${props.appName}-${props.stackShortName}-appsync-gql`,
      envVars: { ...environmentVars },
    }),
};
