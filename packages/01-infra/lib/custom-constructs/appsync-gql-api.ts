import * as cdk from "aws-cdk-lib";
import { IAM } from "../utils/iam";
import { Construct } from "constructs";
import { PocStackProps } from "../interface";
import { Lambdas } from "../utils/lambdas";
import { LambdaBasic } from "./lambda-basic";

interface AppSyncGqlApiProps extends PocStackProps {
  apiName: string;
  environmentVars?: Record<string, string>;
  userPoolRegion: string;
  userPoolId: string;
}

export class AppSyncGqlApi extends Construct {
  readonly graphqlApi: cdk.aws_appsync.CfnGraphQLApi;
  readonly lambdaResolvers: LambdaBasic;

  constructor(scope: Construct, id: string, props: AppSyncGqlApiProps) {
    super(scope, id);

    this.graphqlApi = new cdk.aws_appsync.CfnGraphQLApi(this, props.apiName, {
      name: props.apiName,
      logConfig: {
        fieldLogLevel: "ALL",
        excludeVerboseContent: true,
        cloudWatchLogsRoleArn: IAM.roles.appSyncLogsRole(
          this,
          "AppSyncLogsRole",
          `${props.appName}-${props.stackShortName}-appsync-logs-role`
        ).roleArn,
      },
      authenticationType: "AMAZON_COGNITO_USER_POOLS",
      additionalAuthenticationProviders: [{ authenticationType: "AWS_IAM" }, { authenticationType: "API_KEY" }],
      userPoolConfig: {
        awsRegion: props.userPoolRegion,
        userPoolId: props.userPoolId,
        defaultAction: "ALLOW",
      },
    });

    new cdk.aws_appsync.CfnGraphQLSchema(this, `${props.apiName}-schema`, {
      apiId: this.graphqlApi.attrApiId,
      definition: simpleInlineSchema,
    });

    this.lambdaResolvers = Lambdas.createAppSyncGqlApi(this, props, { ...props.environmentVars });
    const lambdaDataSource = new cdk.aws_appsync.CfnDataSource(this, "ApiLambdaDataSource", {
      apiId: this.graphqlApi.attrApiId,
      name: "GqlLambdaDataSource",
      type: "AWS_LAMBDA",
      lambdaConfig: {
        lambdaFunctionArn: this.lambdaResolvers.function.functionArn,
      },
      serviceRoleArn: IAM.roles.appSyncInvokeLambdaRole(
        this,
        "GqlLambdaInvokeRole",
        "GqlLambdaInvokeRole",
        this.lambdaResolvers.function.functionArn
      ).roleArn,
    });

    new cdk.aws_appsync.CfnResolver(this, "QueryResolver1", {
      apiId: this.graphqlApi.attrApiId,
      typeName: "Query",
      fieldName: "hello",
      dataSourceName: lambdaDataSource.attrName,
    });

    new cdk.CfnOutput(this, "Id", {
      value: this.graphqlApi.attrApiId,
      description: "AppSync GraphQL API Id",
      key: "AppsyncApiId",
    });

    new cdk.CfnOutput(this, "Url", {
      value: this.graphqlApi.attrGraphQlUrl,
      description: "AppSync GraphQL API Url",
      key: "AppsyncApiUrl",
    });

    new cdk.CfnOutput(this, "DataSrc", {
      value: lambdaDataSource.attrName,
      description: "AppSync GraphQL API Data Source Name",
      key: "AppsyncLambdaDatasource",
    });
  }
}

const simpleInlineSchema = `type Query {
    hello: String
  }
`;
