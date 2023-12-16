import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PocStackProps } from "../interface";
import { LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

interface ApiGwRestApiProps extends PocStackProps {
  function: cdk.aws_lambda.Function;
}

export class ApiGwRestApi extends Construct {
  readonly lambdaRestApiGw: cdk.aws_apigateway.LambdaRestApi;

  constructor(scope: Construct, id: string, props: ApiGwRestApiProps) {
    super(scope, id);

    this.lambdaRestApiGw = new LambdaRestApi(this, "ApiGw", {
      restApiName: `${props.appName}-api`,
      description: "Poc API Gateway",
      deployOptions: {
        stageName: props.stackShortName,
        throttlingRateLimit: props.apiGw.throttling.defaultLimits.rateLimit,
        throttlingBurstLimit: props.apiGw.throttling.defaultLimits.burstLimit,
      },
      binaryMediaTypes: ["multipart/form-data"],
      handler: props.function,
      proxy: false,
    });

    // Do not automatically create ANY method yet, we will add it later
    const proxyResource = this.lambdaRestApiGw.root.addProxy({ anyMethod: false });
    const anyMethod = proxyResource.addMethod("ANY", new LambdaIntegration(props.function), {
      apiKeyRequired: true,
    });

    // Create a usage plan and associate the API Key with the plan
    const usagePlan = new cdk.aws_apigateway.UsagePlan(this, "ApiBasicPlan", {
      name: `${props.appName}-basic-plan`,
      description: "Basic usage plan",
      quota: {
        limit: props.apiGw.throttling.basicPlanLimits.quotaLimitDaily,
        period: cdk.aws_apigateway.Period.DAY,
      },
      throttle: {
        rateLimit: props.apiGw.throttling.basicPlanLimits.rateLimit,
        burstLimit: props.apiGw.throttling.basicPlanLimits.burstLimit,
      },
      apiStages: [
        {
          api: this.lambdaRestApiGw,
          stage: this.lambdaRestApiGw.deploymentStage,
          throttle: [
            {
              method: anyMethod,
              throttle: {
                rateLimit: props.apiGw.throttling.basicPlanLimits.rateLimit,
                burstLimit: props.apiGw.throttling.basicPlanLimits.burstLimit,
              },
            },
          ],
        },
      ],
    });

    // Add a default API Key
    usagePlan.addApiKey(
      new cdk.aws_apigateway.ApiKey(this, "ApiKey", {
        apiKeyName: `${props.appName}-default-key`,
        description: "Default API Key created by the cdk infra project",
        enabled: true,
      })
    );
  }
}
