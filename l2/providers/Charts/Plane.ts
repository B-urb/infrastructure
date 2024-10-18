import * as k8s from "@pulumi/kubernetes"
import {Lifted, Output } from "@pulumi/pulumi";
import versions from "../../versions";
import {Namespace} from "@pulumi/kubernetes/core/v1";

export default function createPlaneHelm(namespace: Namespace, config: {
  awsS3Bucket: Output<string>;
  s3UserSecret: Output<string>;
  awsS3Region: Output<string>;
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
        postgres: {
          local_setup: false
        },
      rabbitmq: {
        storageClass: "default"
      },
        redis: {
          local_setup: false
        },
        minio: {
          local_setup: false
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