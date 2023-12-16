#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { PocInfraStack } from "../lib/poc-infra-stack";
import { PocStackProps } from "../lib/interface";

// Define props for the dev stack
const DevStackProps: PocStackProps = {
  appName: "poc",
  stackShortName: "dev",
  defaultRegion: "ap-southeast-2",
  lambda: {
    memSizeInMb: 512,
    timeoutInSecs: 30,
  },
  apiGw: {
    throttling: {
      defaultLimits: {
        rateLimit: 5,
        burstLimit: 5,
      },
      basicPlanLimits: {
        rateLimit: 5,
        burstLimit: 5,
        quotaLimitDaily: 200,
      },
    },
  },
  s3: {
    uploadBucketExpiryDays: 1,
  },
};

const app = new cdk.App();
new PocInfraStack(app, `poc-${DevStackProps.stackShortName}`, DevStackProps);
