import * as k8s from "@pulumi/kubernetes"
import {Namespace} from "@pulumi/kubernetes/core/v1";
import {redisDBPassword} from "../../../../util/env";

export function createRedisHelm(namespace: Namespace) {
  return new k8s.helm.v3.Chart("redis", {
        chart: "redis",
        namespace: namespace.metadata.name,
        version: "18.13.0",
        fetchOpts: {
          repo: "https://charts.bitnami.com/bitnami",
        },
        values: {
          "global": {
            "redis":{
                "password": redisDBPassword,
            }
          },
          replica: {
            replicaCount: 1
          }
        }
      }
  );
}

