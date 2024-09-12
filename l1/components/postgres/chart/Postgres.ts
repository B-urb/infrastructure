import * as k8s from "@pulumi/kubernetes"
import {Namespace} from "@pulumi/kubernetes/core/v1";
import {dbUsername} from "../../../../util/env";
import {RandomPassword} from "@pulumi/random";
import versions from "../../../versions";




export function createPostgresHelm(namespace: Namespace, dbRootPassword: RandomPassword, appDbPassword: RandomPassword) {
  return new k8s.helm.v3.Chart("postgres", {
        chart: versions.postgresql.depName,
        namespace: namespace.metadata.name,
        version:versions.postgresql.version ,
        fetchOpts: {
          repo: versions.postgresql.registryUrl,
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
            "extendedConfiguration": "max_connections = 400",
            "replicaCount": 1
          }
        }
      }
  );
}

