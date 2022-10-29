import * as k8s from "@pulumi/kubernetes"
import {Namespace, Secret} from "@pulumi/kubernetes/core/v1";

export default function createBackupCronjob(namespace: Namespace, dbSecret: Secret, s3Secret: Secret) {
  return new k8s.batch.v1.CronJob("backup-directus", {
    metadata: {
      name: "directus-backup",
      namespace: namespace.metadata.name
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
                    name: "DB_USER",
                    valueFrom: {secretKeyRef: {name:dbSecret.metadata.name, key: "user"}}
                  },
                    {
                      name: "DB_HOST",
                      value: "directus-release-mariadb"
                    }, {
                    name: "DB_PASSWORD",
                      valueFrom: {secretKeyRef: {name:dbSecret.metadata.name, key: "password"}}
                    },
                    {name: "S3_ENDPOINT",
                      value: "minio.fbr.ai"
                    },
                    {name: "AWS_REGION",
                    value: "US"},
                    {
                      name: "S3_BUCKET_NAME",
                      value: "directus-backup"
                    },
                    {name: "AWS_ACCESS_KEY_ID", valueFrom: {secretKeyRef: {name:s3Secret.metadata.name, key:"user-key"}}},
                    {name: "AWS_SECRET_ACCESS_KEY", valueFrom: {secretKeyRef: {name: s3Secret.metadata.name, key:"user-secret"}}},
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
