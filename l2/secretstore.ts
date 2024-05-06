import {awsProvider} from "./index";
import {Provider} from "@pulumi/kubernetes";
import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";
import {create} from "node:domain";

export function createSecretStore(provider: Provider) {
// Create an IAM user for secrets management
  const secretsUser = new aws.iam.User("secretsUser", {
    name: "secretsManagerUser"
  },{provider: awsProvider});

// Attach policy to the user that allows managing Secrets Manager
  const policy = new aws.iam.Policy("policy", {
    description: "Policy that allows management of Secrets Manager",
    policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [{
        Action: [
          "secretsmanager:*"
        ],
        Resource: "*",
        Effect: "Allow"
      }]
    })
  },{provider: awsProvider});

// Attach policy to the user
new aws.iam.UserPolicyAttachment("userPolicyAttachment", {
    user: secretsUser.name,
    policyArn: policy.arn
  },  {provider: awsProvider});

// Create access key for the IAM user
  const accessKey = new aws.iam.AccessKey("accessKey", {
    user: secretsUser.name
  }, {provider: awsProvider});

// Export the access key and secret
  const awsAccessKeyId = accessKey.id;
  const awsSecretAccessKey = accessKey.secret;

// Create a SecretStore that references AWS Secrets Manager with IAM user credentials
return new k8s.apiextensions.CustomResource("aws-secret-store", {
    apiVersion: "external-secrets.io/v1beta1",
    kind: "SecretStore",
    metadata: {
      name: "aws-secret-store"
    },
    spec: {
      provider: {
        aws: {
          service: "SecretsManager",
          region: "eu-central-1", // Frankfurt region
          auth: {
            secretRef: {
              accessKeyIDSecretRef: {
                name: "aws-creds",
                key: "accessKey"
              },
              secretAccessKeySecretRef: {
                name: "aws-creds",
                key: "secretAccessKey"
              }
            }
          }
        }
      }
    }
  }, {provider: provider});
}