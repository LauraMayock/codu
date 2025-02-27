import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";

interface Props extends cdk.StackProps {
  production?: boolean;
}

export class StorageStack extends cdk.Stack {
  public readonly bucket;
  public readonly originAccessIdentity;
  public readonly db;
  public readonly vpc;

  constructor(scope: Construct, id: string, props?: Props) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "StorageStackVpc");
    const { vpc } = this;
    // s3 bucket
    const bucketName = ssm.StringParameter.valueForStringParameter(
      this,
      "/env/bucketname",
      1
    );

    this.originAccessIdentity = new OriginAccessIdentity(this, "OAI", {
      comment: "Created by cdk",
    });

    this.bucket = new s3.Bucket(this, "uploadBucket", {
      bucketName,
      removalPolicy: props?.production
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      publicReadAccess: true,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT],
          allowedOrigins: ["*"], // TODO: Lock down on prod
          allowedHeaders: ["*"],
        },
      ],
    });

    this.bucket.grantRead(new iam.AccountRootPrincipal());
    this.bucket.grantRead(this.originAccessIdentity);

    const dbUsername = ssm.StringParameter.valueForStringParameter(
      this,
      "/env/db/username",
      1
    );

    const dbName = ssm.StringParameter.valueForStringParameter(
      this,
      "/env/db/name",
      1
    );

    // RDS
    this.db = new rds.DatabaseInstance(this, "db-instance", {
      instanceIdentifier: "codu-rds",
      databaseName: dbName,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14_5,
      }),
      credentials: rds.Credentials.fromPassword(
        dbUsername,
        cdk.SecretValue.ssmSecure("/env/db/password", "1")
      ),
      vpc: vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PUBLIC,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO
      ),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      publiclyAccessible: true,
      deletionProtection: false,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(props?.production ? 3 : 0),
    });
    // Allow connections on default port from any IPV4
    // TODO: Lock down on prod
    this.db.connections.allowDefaultPortFromAnyIpv4();
  }
}
