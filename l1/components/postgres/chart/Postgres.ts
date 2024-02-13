import * as k8s from "@pulumi/kubernetes"
import {Namespace} from "@pulumi/kubernetes/core/v1";
import {dbUsername} from "../../../../util/env";
import {RandomPassword} from "@pulumi/random";




export function createPostgresHelm(namespace: Namespace, dbRootPassword: RandomPassword, appDbPassword: RandomPassword) {
  return new k8s.helm.v3.Chart("postgres", {
        chart: "postgresql",
        namespace: namespace.metadata.name,
        version: "14.0.5",
        fetchOpts: {
          repo: "https://charts.bitnami.com/bitnami",
        },
        values: {
         "global": {
           "postgresql":{
             "auth": {
               "database": "applications",
               "username": "applicationDbAdmin",
               "password": appDbPassword.result,
               "postgresPassword": dbRootPassword.result
             }
           }
         },
          "architecture": "replication",
          "primary": {
            "extendedConfiguration": "max_connections = 400"
            },
          "readReplicas": {
           "replicaCount": 2
          }
        }
      }
  );
}

