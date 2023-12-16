import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PocStackProps } from "../interface";

interface S3AutoDeleteBucketProps extends PocStackProps {
  bucketName: string;
  corsRules?: cdk.aws_s3.CorsRule[] | undefined;
}

export class S3AutoDeleteBucket extends Construct {
  readonly s3Bucket: cdk.aws_s3.Bucket;

  constructor(scope: Construct, id: string, props: S3AutoDeleteBucketProps) {
    super(scope, id);

    this.s3Bucket = new cdk.aws_s3.Bucket(this, `S3-${id}`, {
      bucketName: props.bucketName,
      objectOwnership: cdk.aws_s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: props.corsRules,
    });

    this.s3Bucket.addLifecycleRule({
      expiration: cdk.Duration.days(props.s3.uploadBucketExpiryDays),
    });
  }
}
