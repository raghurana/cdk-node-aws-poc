import * as cdk from "aws-cdk-lib";

export interface PocStackProps extends cdk.StackProps {
  appName: string;
  stackShortName: string;
  defaultRegion: string;
  lambda: {
    memSizeInMb: number;
    timeoutInSecs: number;
  };
  apiGw: {
    throttling: {
      defaultLimits: {
        rateLimit: number; // Average requests per second over an extended period of time
        burstLimit: number; // Maximum rate limit over a time ranging from one to a few seconds
      };
      basicPlanLimits: {
        rateLimit: number;
        burstLimit: number;
        quotaLimitDaily: number;
      };
    };
  };
  s3: {
    uploadBucketExpiryDays: number;
  };
}
