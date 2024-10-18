import * as k8s from "@pulumi/kubernetes"
import {Namespace} from "@pulumi/kubernetes/core/v1";
import {redisDBPassword} from "../../../../util/env";
import versions from "../../../versions";

export function createRedisHelm(namespace: Namespace) {
  return new k8s.helm.v3.Chart("redis", {
        chart: versions.redis.depName,
        namespace: namespace.metadata.name,
        version: versions.redis.version,
        fetchOpts: {
          repo: versions.redis.registryUrl,
        },
        values: {
          "global": {
            "redis":{
                "password": redisDBPassword,
            }
          },
          auth: {
            enabled: false,
            sentinel: false,
          },
          master: {
            persistence: {
              size: "3Gi"
            },
          },
          replica: {
            persistence: {
              size: "3Gi"
            },
            replicaCount: 1
          }
        }
      }
  );
}

