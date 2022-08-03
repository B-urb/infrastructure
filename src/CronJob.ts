import * as k8s from "@pulumi/kubernetes"
import {directusS3Secret, mariaDbBackupSecret} from "./Secrets";
import {namespaceDirectus} from "./namespace";







export default function createCronjob() {


  return new k8s.batch.v1.CronJob("backup-directus", {
    metadata: {
      name: "directus-backup",
      namespace: namespaceDirectus.metadata.name
   },
    spec: {
      schedule: "0 2 * * *",
      jobTemplate: {
        spec: {
          template: {
            spec: {
              containers: [
                {
                  name: "directus-backup",
                  image: "bjoern5urban/mariadb-s3-backup:latest",
                  imagePullPolicy: "Always",
                  env: [{
                    name: "MARIADB_USER",
                    valueFrom: {secretKeyRef: {name:mariaDbBackupSecret.metadata.name, key: "user"}}
                  },
                    {
                      name: "MARIADB_HOST",
                      value: "directus-release-mariadb"
                    }, {
                    name: "MARIADB_PASSWORD",
                      valueFrom: {secretKeyRef: {name:mariaDbBackupSecret.metadata.name, key: "password"}}
                    },
                    {name: "S3_ENDPOINT",
                      value: "minio.fbr.ai"
                    },
                    {name: "AWS_REGION",
                    value: "US"},
                    {
                      name: "S3_BUCKET_NAME",
                      value: "directus"
                    },
                    {name: "AWS_ACCESS_KEY_ID", valueFrom: {secretKeyRef: {name:directusS3Secret.metadata.name, key:"user-key"}}},
                    {name: "AWS_SECRET_ACCESS_KEY", valueFrom: {secretKeyRef: {name: directusS3Secret.metadata.name, key:"user-secret"}}},
                  ]
                }
              ],
              restartPolicy: "OnFailure"

            }
          }
        }
      }
    }
      }
  )
}
