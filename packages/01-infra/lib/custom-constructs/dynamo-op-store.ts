import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface DynamoOpStoreProps {
  tableName: string;
}

export class DynamoOpStore extends Construct {
  readonly dynamoDbTable: cdk.aws_dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoOpStoreProps) {
    super(scope, id);
    this.dynamoDbTable = new cdk.aws_dynamodb.Table(this, "MainOpStore", {
      tableName: props.tableName,
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "PK",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      timeToLiveAttribute: "TTL",
    });

    // Create GSIs and LSIs

    new cdk.CfnOutput(this, "MainOpStoreTableName", {
      value: this.dynamoDbTable.tableName,
      description: "Main DynamoDB table name",
      key: "DynamodbMainTableName",
    });
  }
}
