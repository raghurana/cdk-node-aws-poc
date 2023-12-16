import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { PocStackProps } from "../interface";

interface CognitoUserPoolProps extends PocStackProps {
  poolName: string;
}

export class CognitoUserPool extends Construct {
  readonly userPool: cdk.aws_cognito.UserPool;

  constructor(scope: Construct, id: string, props: CognitoUserPoolProps) {
    super(scope, id);

    this.userPool = new cdk.aws_cognito.UserPool(this, "CognitoAuthPool", {
      userPoolName: props.poolName,
      selfSignUpEnabled: false,
      accountRecovery: cdk.aws_cognito.AccountRecovery.NONE,
      signInAliases: { email: true },
      standardAttributes: {
        givenName: { required: true, mutable: true },
        email: { required: true, mutable: true },
      },
      passwordPolicy: {
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cdk.aws_cognito.UserPoolClient(this, "ReactFrontend", {
      userPool: this.userPool,
      userPoolClientName: "react-frontend",
      generateSecret: false,
      authFlows: { userPassword: true, userSrp: true },
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    userPoolClient.node.addDependency(this.userPool);

    new cdk.CfnOutput(this, "CognitoUserPoolId", {
      value: this.userPool.userPoolId,
      description: "Cognito User Pool Id",
      key: "CognitoUserPoolId",
    });

    new cdk.CfnOutput(this, "CognitoUserPoolClientId", {
      value: userPoolClient.userPoolClientId,
      description: "Cognito User Pool Client Id for react",
      key: "CognitoUserPoolClientId",
    });
  }
}
