import {namespacePostgres} from "./namespace";
import * as k8s from "@pulumi/kubernetes"
import {mariaDbBackupSecret} from "./Secrets";

const dbPassword = process.env.CI_DB_PASSWORD
const dbUsername = process.env.CI_DB_USERNAME
const dbRootPassword = process.env.CI_DB_ROOT_PASSWORD;
export function createPostgres() {

  return new k8s.helm.v3.Chart("directus-release", {
        chart: "postgres",
        namespace: namespacePostgres.metadata.name,
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

export const postgres = createPostgres();
