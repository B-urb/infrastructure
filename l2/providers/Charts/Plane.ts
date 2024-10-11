import * as k8s from "@pulumi/kubernetes"
import {Lifted, Output } from "@pulumi/pulumi";
import versions from "../../versions";
import {Namespace} from "@pulumi/kubernetes/core/v1";

export default function createPlaneHelm(namespace: Namespace, config: {
  awsS3Bucket: Output<string>;
  s3UserSecret: Output<string>;
  awsS3Region: Output<"af-south-1" | "ap-east-1" | "ap-northeast-1" | "ap-northeast-2" | "ap-northeast-3" | "ap-south-1" | "ap-south-2" | "ap-southeast-1" | "ap-southeast-2" | "ap-southeast-3" | "ap-southeast-4" | "ca-central-1" | "ca-west-1" | "cn-north-1" | "cn-northwest-1" | "eu-central-1" | "eu-central-2" | "eu-north-1" | "eu-south-1" | "eu-south-2" | "eu-west-1" | "eu-west-2" | "eu-west-3" | "me-central-1" | "me-south-1" | "sa-east-1" | "us-gov-east-1" | "us-gov-west-1" | "us-east-1" | "us-east-2" | "us-west-1" | "us-west-2"> & Lifted<"af-south-1" | "ap-east-1" | "ap-northeast-1" | "ap-northeast-2" | "ap-northeast-3" | "ap-south-1" | "ap-south-2" | "ap-southeast-1" | "ap-southeast-2" | "ap-southeast-3" | "ap-southeast-4" | "ca-central-1" | "ca-west-1" | "cn-north-1" | "cn-northwest-1" | "eu-central-1" | "eu-central-2" | "eu-north-1" | "eu-south-1" | "eu-south-2" | "eu-west-1" | "eu-west-2" | "eu-west-3" | "me-central-1" | "me-south-1" | "sa-east-1" | "us-gov-east-1" | "us-gov-west-1" | "us-east-1" | "us-east-2" | "us-west-1" | "us-west-2">;
  planeKey: Output<string>;
  dbName: Output<string>;
  redisConnectionString: string;
  s3UserKey: Output<string>;
  dbConnectionString: Output<string>;
  awsS3Endpoint: Output<string>;
  url: string
}) {
  return new k8s.helm.v3.Chart("plane", {
    chart: versions.plane.depName,
    namespace: namespace.metadata.name,
    fetchOpts: {
      repo: versions.plane.registryUrl,
    },
    values: {
      license: {
        licenceDomain: config.url
      },
      ingress: {
        appHost: config.url
      },
      services: {
        postgres: {
          local_setup: false
        },
        redis: {
          local_setup: false
        },
        minio: {
          local_setup: false
        }
      },
      env: {
        pgdb_database: config.dbName,
        pgdb_remote_url: config.dbConnectionString,
        remote_redis_url: config.redisConnectionString,
        storage_class: "default",
        aws_access_key: config.s3UserKey,
        aws_secret_access_key: config.s3UserSecret,
        aws_region: config.awsS3Region,
        aws_s3_endpoint_url: config.awsS3Endpoint,
        docstore_bucket: config.awsS3Bucket,
        secret_key: config.planeKey
      }
    }
  })
}