import * as k8s from "@pulumi/kubernetes"
import {getEnv} from "@pulumi/kubernetes/utilities";
import {WebService} from "./types/WebService";
import {directusS3Secret} from "./Secrets";
import {Deployment} from "@pulumi/kubernetes/apps/v1";


const env = getEnv("development")
const adminPassword = process.env.CI_ADMIN_PASSWORD
const adminMail = process.env.CI_ADMIN_EMAIL
const mariaDBPassword = process.env.CI_DB_PASSWORD
const mariaDBUsername = process.env.CI_DB_USERNAME
const redisDBPassword = process.env.CI_REDIS_PASSWORD
const mariaDBRootPassword = process.env.CI_DB_ROOT_PASSWORD;

export function createDirectusDeployments(website: WebService): Deployment {
  const appLabels = {};
  return new k8s.apps.v1.Deployment(website.name, {
    metadata: {
      name: website.name,
      namespace: website.namespace.metadata.name,
      labels: {
        name: website.name
      },
      "annotations": {
        "keel.sh/trigger": "poll",
        "keel.sh/pollSchedule": "@every 5m",
        ...website.keelAnnotations

      }
    },
    "spec": {
      "strategy": {
        "type": "Recreate"
      },
      "selector": {
        "matchLabels": {
          "name": website.name
        }
      },

      "template": {
        "metadata": {
          "labels": {
            "name": website.name
          }
        },
        "spec": {
          "nodeSelector": {
            "owner": "felix"
          },
/*          dnsConfig: {
            options: [{
              name: "ndots",
              value: "5"
            }]
          },
          dnsPolicy: "ClusterFirst",*/
          "containers": [
            {
              "name": website.name,
              "image": website.registryImage + ":" + website.imageTag,
              "imagePullPolicy": "Always",
              "env": [
                {
                  name: "KEY",
                  value: "test"
                },
                {
                  name: "SECRET",
                  value: "test"
                },
                {name: "PUBLIC_URL", value: "https://" + website.url},
                {
                  name: "ADMIN_EMAIL",
                  value: adminMail
                },
                {
                  name: "ASSETS_CONTENT_SECURITY_POLICY_DIRECTIVES__MEDIA_SRC",
                  value: "array:'self',https://cmstest.burban.me"
                }, {
                  name: "ASSETS_CONTENT_SECURITY_POLICY_DIRECTIVES__SCRIPT_SRC",
                  value: "array:'self', 'unsafe-inline'"
                },
                {
                  name: "CONTENT_SECURITY_POLICY_DIRECTIVES__SCRIPT_SRC_ATTR",
                  value: "null"
                },
                {
                  name: "CORS_ENABLED",
                  value: "true"
                },
                {
                  name: "CORS_ORIGIN",
                  value: "https://burban.me,https://dev.burban.me,https://dev.tischlerei-bahrenberg.de,https://tischlerei-bahrenberg.de"
                },
                {
                  name: "ADMIN_PASSWORD",
                  value: adminPassword
                },
                {name: "DB_CLIENT", value: "pg"},
                {name: "DB_HOST", value: "postgres-postgresql.postgres.svc.cluster.local"},
                {name: "DB_PORT", value: "5432"},
                {
                  name: "DB_PASSWORD",
                  valueFrom: {secretKeyRef: {name: "directus-release-mariadb", key: "mariadb-password"}}
                },
                {name: "DB_USER", value: "directus"},
                {name: "DB_DATABASE", value: "directus"},
                //S3
                {name: "STORAGE_LOCATIONS", value: "s3"},
                {name: "STORAGE_S3_DRIVER", value: "s3"},
                {name: "STORAGE_S3_ENDPOINT", value: "http://minio.minio"},
                {
                  name: "STORAGE_S3_KEY",
                  valueFrom: {secretKeyRef: {name: directusS3Secret.metadata.name, key: "user-key"}}
                },
                {
                  name: "STORAGE_S3_SECRET",
                  valueFrom: {secretKeyRef: {name: directusS3Secret.metadata.name, key: "user-secret"}}
                },
                {name: "STORAGE_S3_BUCKET", value: "directus"},
                {name: "STORAGE_S3_S3_FORCE_PATH_STYLE", value: "true"}

              ],
              "ports": [
                {
                  "name": "http",
                  "containerPort": 8055
                }
              ]
            }
          ],
          imagePullSecrets: [
            {"name": website.gitlabSecret.metadata.name}
          ]

        }

      }
    }
  })
}
