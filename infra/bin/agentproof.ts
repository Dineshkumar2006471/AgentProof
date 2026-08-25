#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AgentProofStack } from "../lib/agentproof-stack";

const app = new cdk.App();
const environment = app.node.tryGetContext("environment") ?? "development";

new AgentProofStack(app, `AgentProof-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-south-1"
  },
  environment
});
