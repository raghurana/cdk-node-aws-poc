import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export const IAM = {
  roles: {
    basicExecutionLambdaRole: (scope: Construct, id: string, roleName: string) =>
      new cdk.aws_iam.Role(scope, id, {
        roleName: roleName,
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        ],
      }),
    appSyncLogsRole: (scope: Construct, id: string, roleName: string) =>
      new cdk.aws_iam.Role(scope, id, {
        roleName: roleName,
        assumedBy: new cdk.aws_iam.ServicePrincipal("appsync.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSAppSyncPushToCloudWatchLogs"),
        ],
      }),
    appSyncInvokeLambdaRole: (scope: Construct, id: string, roleName: string, lambdaArn: string) =>
      new cdk.aws_iam.Role(scope, id, {
        roleName: roleName,
        assumedBy: new cdk.aws_iam.ServicePrincipal("appsync.amazonaws.com"),
        inlinePolicies: {
          invokeLambda: new cdk.aws_iam.PolicyDocument({
            statements: [
              new cdk.aws_iam.PolicyStatement({
                actions: ["lambda:InvokeFunction"],
                effect: cdk.aws_iam.Effect.ALLOW,
                resources: [lambdaArn],
              }),
            ],
          }),
        },
      }),
  },
  policyStatements: {
    qldbTablesReaderWriter: (ledgerName: string) =>
      new cdk.aws_iam.PolicyStatement({
        actions: [
          "qldb:PartiQLCreateTable",
          "qldb:PartiQLSelect",
          "qldb:PartiQLInsert",
          "qldb:PartiQLUpdate",
          "qldb:SendCommand",
        ],
        effect: cdk.aws_iam.Effect.ALLOW,
        resources: [
          `arn:aws:qldb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:ledger/${ledgerName}`,
          `arn:aws:qldb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:ledger/${ledgerName}/table/*`,
        ],
      }),
    qldbInfoSchemaReader: (ledgerName: string) =>
      new cdk.aws_iam.PolicyStatement({
        actions: ["qldb:PartiQLSelect"],
        effect: cdk.aws_iam.Effect.ALLOW,
        resources: [`arn:aws:qldb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:ledger/${ledgerName}/information_schema/*`],
      }),
    lambdaInvokeAppSync: (appSyncApiId: string) =>
      new cdk.aws_iam.PolicyStatement({
        actions: ["appsync:GraphQL"],
        effect: cdk.aws_iam.Effect.ALLOW,
        resources: [`arn:aws:appsync:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:apis/${appSyncApiId}/*`],
      }),
  },
};
