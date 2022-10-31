import * as k8s from "@pulumi/kubernetes"
import {Namespace} from "@pulumi/kubernetes/core/v1";

const dbPassword = process.env.CI_DB_PASSWORD
const dbUsername = process.env.CI_DB_USERNAME
const dbRootPassword = process.env.CI_DB_ROOT_PASSWORD;


export function createPostgresHelm(namespace: Namespace) {
  return new k8s.helm.v3.Chart("postgres", {
        chart: "postgresql",
        namespace: namespace.metadata.name,
        version: "11.9.13",
        fetchOpts: {
          repo: "https://charts.bitnami.com/bitnami",
        },
        values: {
         "global": {
           "storageClass": "juice",
           "postgresql":{
             "auth": {
               "database": "directus",
               "username": dbUsername,
               "password": dbPassword,
               "postgresPassword": dbRootPassword
             }
           }
         }
        }
      }
  );
}

