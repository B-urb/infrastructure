import * as k8s from "@pulumi/kubernetes"
import {directusS3Secret} from "./Secrets";







export default function createCronjob() {
const namespace = new k8s.core.v1.Namespace("directus")
  return new k8s.batch.v1.CronJob("backup-directus", {
    metadata: {
      name: "directus-backup",
      namespace: namespace.metadata.name,
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
                  image: "mobilejazz/mariadb-backup-s3:latest",
                  imagePullPolicy: "always",
                  env: [{
                    name: "MYSQL_USER",
                    value: "directus"
                  },
                    {
                      name: "MYSQL_HOST",
                      value: "directus-mariadb.directus"
                    }, {
                    name: "MYSQL_PASSWORD",
                      valueFrom: {secretKeyRef: {name:"directus-release-mariadb", key: "mariadb-password"}}
                    },
                    {name: "S3_ENDPOINT",
                      value: "http://minio.minio"
                    },
                    {
                      name: "S3_BUCKET",
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
