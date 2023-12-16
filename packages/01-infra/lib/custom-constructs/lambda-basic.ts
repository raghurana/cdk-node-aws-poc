import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PocStackProps } from "../interface";

interface LambdaBasicProps extends PocStackProps {
  funcName: string;
  envVars?: Record<string, string>;
}

export class LambdaBasic extends Construct {
  readonly function: cdk.aws_lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaBasicProps) {
    super(scope, id);
    this.function = new cdk.aws_lambda.Function(this, "BasicLambda", {
      functionName: props.funcName,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      memorySize: props.lambda.memSizeInMb,
      timeout: cdk.Duration.seconds(props.lambda.timeoutInSecs),
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      tracing: cdk.aws_lambda.Tracing.ACTIVE,
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      environment: {
        ...props.envVars,
        NODE_ENV: "production",
        NODE_OPTIONS: "--enable-source-maps",
      },
      code: cdk.aws_lambda.Code.fromInline(simpleInlineCode),
      handler: "index.handler",
    });
  }
}

const simpleInlineCode = `exports.handler = async function(event, context) {
    console.log("Event: ", JSON.stringify(event, null, 2));
    return {
      statusCode: 200,
      body: 'Hello from Lambda!'
    };
  };
`;
