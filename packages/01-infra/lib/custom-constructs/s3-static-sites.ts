import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { PocStackProps } from "../interface";

interface S3StaticSiteProps extends PocStackProps {}

export class S3StaticSites extends Construct {
  readonly cloudfrontDistro: cdk.aws_cloudfront.Distribution;
  readonly spaBucket: cdk.aws_s3.Bucket;

  constructor(scope: Construct, id: string, props: S3StaticSiteProps) {
    super(scope, id);

    this.spaBucket = new cdk.aws_s3.Bucket(this, "ReactSpaS3Bucket1", {
      bucketName: `${props.appName}-${props.stackShortName}-react-spa1`,
      accessControl: cdk.aws_s3.BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new cdk.aws_s3_deployment.BucketDeployment(this, "ReactSpaBucketDeployment1", {
      destinationBucket: this.spaBucket,
      sources: [cdk.aws_s3_deployment.Source.asset("./assets/spa")],
    });

    const originAccessIdentity = new cdk.aws_cloudfront.OriginAccessIdentity(this, "OriginAccessId");
    this.spaBucket.grantRead(originAccessIdentity);

    this.cloudfrontDistro = new cdk.aws_cloudfront.Distribution(this, "SpaCloudFrontDistro", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new cdk.aws_cloudfront_origins.S3Origin(this.spaBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    new cdk.CfnOutput(this, "S3SpaBucketName", {
      description: "S3 Bucket Name for React App",
      value: this.spaBucket.bucketName,
      key: "S3SpaBucketName",
    });

    new cdk.CfnOutput(this, "CloudFrontDistroDomainName", {
      description: "Frontend React App Url",
      value: `https://${this.cloudfrontDistro.distributionDomainName}`,
    });
  }
}
