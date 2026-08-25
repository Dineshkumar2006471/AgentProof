import * as cdk from "aws-cdk-lib";
import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as eventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";

export interface AgentProofStackProps extends StackProps {
  environment: string;
}

export class AgentProofStack extends Stack {
  constructor(scope: Construct, id: string, props: AgentProofStackProps) {
    super(scope, id, props);

    const suffix = props.environment.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const table = new dynamodb.Table(this, "ApplicationTable", {
      tableName: `agentproof-${suffix}`,
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true
      },
      removalPolicy: RemovalPolicy.RETAIN
    });

    table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });
    table.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "GSI2PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI2SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });
    table.addGlobalSecondaryIndex({
      indexName: "GSI3",
      partitionKey: { name: "GSI3PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI3SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    const reportsBucket = new s3.Bucket(this, "ReportsBucket", {
      bucketName: `agentproof-reports-${suffix}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      lifecycleRules: [{ expiration: Duration.days(365) }],
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false
    });

    const deadLetterQueue = new sqs.Queue(this, "VerificationDeadLetterQueue", {
      queueName: `agentproof-verification-dlq-${suffix}`,
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      retentionPeriod: Duration.days(14)
    });

    const verificationQueue = new sqs.Queue(this, "VerificationQueue", {
      queueName: `agentproof-verification-${suffix}`,
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      visibilityTimeout: Duration.minutes(10),
      retentionPeriod: Duration.days(4),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 3
      }
    });

    const openAiSecret = new secretsmanager.CfnSecret(this, "OpenAiApiKeySecret", {
      name: `agentproof/openai/${suffix}`,
      description: "AgentProof OpenAI API key. Value is seeded outside CloudFormation."
    });

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `agentproof-users-${suffix}`,
      signInAliases: { email: true },
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      standardAttributes: { email: { required: true, mutable: false } },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailSubject: "Confirm your AgentProof account",
        emailBody: "Your AgentProof verification code is {####}."
      },
      removalPolicy: RemovalPolicy.RETAIN
    });

    const userPoolClient = userPool.addClient("WebClient", {
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      preventUserExistenceErrors: true,
      enableTokenRevocation: true,
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30)
    });

    const worker = new nodejs.NodejsFunction(this, "VerificationWorker", {
      functionName: `agentproof-verification-worker-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "workers/test-runner-worker/handler.ts",
      handler: "handler",
      timeout: Duration.minutes(5),
      memorySize: 1024,
      logGroup: new logs.LogGroup(this, "VerificationWorkerLogs", {
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.RETAIN
      }),
      environment: {
        AGENTPROOF_ENVIRONMENT: suffix,
        AGENTPROOF_DYNAMODB_TABLE: table.tableName,
        AGENTPROOF_REPORTS_BUCKET: reportsBucket.bucketName,
        AGENTPROOF_VERIFICATION_QUEUE_URL: verificationQueue.queueUrl,
        OPENAI_SECRET_ARN: openAiSecret.ref
      },
      bundling: { minify: true, sourceMap: true }
    });

    table.grantReadWriteData(worker);
    reportsBucket.grantReadWrite(worker);
    verificationQueue.grantConsumeMessages(worker);
    worker.addToRolePolicy(new iam.PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: [openAiSecret.ref]
    }));
    worker.addToRolePolicy(new iam.PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: [this.formatArn({ service: "secretsmanager", resource: `secret:agentproof/agents/${suffix}/*` })]
    }));
    worker.addEventSource(new eventSources.SqsEventSource(verificationQueue, {
      batchSize: 1,
      reportBatchItemFailures: true
    }));

    new cloudwatch.Alarm(this, "WorkerErrorsAlarm", {
      alarmName: `agentproof-worker-errors-${suffix}`,
      metric: worker.metricErrors({ period: Duration.minutes(5), statistic: "Sum" }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });
    new cloudwatch.Alarm(this, "DeadLetterAlarm", {
      alarmName: `agentproof-verification-dlq-${suffix}`,
      metric: deadLetterQueue.metricApproximateNumberOfMessagesVisible({ period: Duration.minutes(5), statistic: "Maximum" }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });
    new cloudwatch.Alarm(this, "QueueAgeAlarm", {
      alarmName: `agentproof-verification-queue-age-${suffix}`,
      metric: verificationQueue.metricApproximateAgeOfOldestMessage({ period: Duration.minutes(5), statistic: "Maximum" }),
      threshold: 300,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    const amplifyComputeRole = new iam.Role(this, "AmplifySsrComputeRole", {
      roleName: `agentproof-amplify-ssr-${suffix}`,
      assumedBy: new iam.ServicePrincipal("amplify.amazonaws.com"),
      description: "Least-privilege runtime role for AgentProof Amplify SSR routes"
    });
    table.grantReadWriteData(amplifyComputeRole);
    reportsBucket.grantReadWrite(amplifyComputeRole);
    verificationQueue.grantSendMessages(amplifyComputeRole);
    amplifyComputeRole.addToPolicy(new iam.PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: [openAiSecret.ref]
    }));
    amplifyComputeRole.addToPolicy(new iam.PolicyStatement({
      actions: ["secretsmanager:CreateSecret"],
      resources: [this.formatArn({ service: "secretsmanager", resource: `secret:agentproof/agents/${suffix}/*` })]
    }));

    new cdk.CfnOutput(this, "AwsRegion", { value: this.region, exportName: `AgentProof-${suffix}-Region` });
    new cdk.CfnOutput(this, "CognitoUserPoolId", { value: userPool.userPoolId, exportName: `AgentProof-${suffix}-UserPoolId` });
    new cdk.CfnOutput(this, "CognitoClientId", { value: userPoolClient.userPoolClientId, exportName: `AgentProof-${suffix}-ClientId` });
    new cdk.CfnOutput(this, "DynamoTableName", { value: table.tableName, exportName: `AgentProof-${suffix}-Table` });
    new cdk.CfnOutput(this, "ReportsBucketName", { value: reportsBucket.bucketName, exportName: `AgentProof-${suffix}-Bucket` });
    new cdk.CfnOutput(this, "VerificationQueueUrl", { value: verificationQueue.queueUrl, exportName: `AgentProof-${suffix}-QueueUrl` });
    new cdk.CfnOutput(this, "OpenAiSecretArn", { value: openAiSecret.ref, exportName: `AgentProof-${suffix}-OpenAiSecretArn` });
    new cdk.CfnOutput(this, "AmplifySsrComputeRoleArn", { value: amplifyComputeRole.roleArn, exportName: `AgentProof-${suffix}-AmplifyRoleArn` });
  }
}
