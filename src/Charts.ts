import * as k8s from "@pulumi/kubernetes"
import {directusS3Secret, etcdSecret, gitlabSecret} from "./Secrets";
import {namespaceDirectus, namespaceEtcd, namespaceGitlab} from "./namespace";
import {serviceAccount} from "./Serviceaccounts";

const adminPassword = process.env.CI_ADMIN_PASSWORD
const adminMail = process.env.CI_ADMIN_EMAIL
const mariaDBPassword = process.env.CI_DB_PASSWORD
const mariaDBUsername = process.env.CI_DB_USERNAME
const redisDBPassword = process.env.CI_REDIS_PASSWORD
const mariaDBRootPassword = process.env.CI_DB_ROOT_PASSWORD;

export function createDirectus() {

  return new k8s.helm.v3.Chart("directus-release", {
        chart: "directus",
        namespace: namespaceDirectus.metadata.name,
        fetchOpts: {
          repo: "https://directus-community.github.io/helm-chart",
        },
        values: {
          "image": {
            //"repository":"registry.gitlab.com/privateprojectsbu/directus",
            "tag":"9.18.1",
            "pullSecrets": [
              {name: gitlabSecret.metadata.name}
                ]
          },
          "ingress": {
            "enabled": "true",
            "tls": [{
              "secretName": "directus" + "-legacy-tls",
              "hosts": ["cms-legacy.burban.me"]
            }],
            "hosts": [
              {
                "paths": [
                  {
                    "pathType": "Prefix",
                    "path": "/"
                  }
                ],
                "host": 'cms-legacy.burban.me'
              }],
            "annotations": {
              "kubernetes.io/ingress.class": "traefik",
              "cert-manager.io/cluster-issuer": "letsencrypt"
            }
          },
          "serviceAccount": {
            "create": false
          },
          "extraEnvVars": [{
            name: "KEY",
            value: "test"
          },
            {
              name: "SECRET",
              value: "test"
            },
            {
              name: "ADMIN_EMAIL",
              value: adminMail
            },
            {
              name: "ASSETS_CONTENT_SECURITY_POLICY_DIRECTIVES__MEDIA_SRC",
              value: "array:'self',https://cms-legacy.burban.me"
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
            {name: "DB_CLIENT", value: "mysql"},
            {name: "DB_HOST", value: "directus-release-mariadb"},
            {name: "DB_PORT", value: "3306"},
            {name: "DB_PASSWORD", valueFrom: {secretKeyRef: {name:"directus-release-mariadb", key: "mariadb-password"}}},
            {name: "DB_USER", value: "directus"},
            {name: "DB_DATABASE", value: "directus"},
              //S3
            {name: "STORAGE_LOCATIONS", value: "s3"},
            {name: "STORAGE_S3_DRIVER", value: "s3" },
            {name: "STORAGE_S3_ENDPOINT", value: "http://minio.minio"},
            {name: "STORAGE_S3_KEY", valueFrom: {secretKeyRef: {name:directusS3Secret.metadata.name, key:"user-key"}}},
            {name: "STORAGE_S3_SECRET", valueFrom: {secretKeyRef: {name: directusS3Secret.metadata.name, key:"user-secret"}}},
            {name: "STORAGE_S3_BUCKET", value: "directus"},
            {name: "STORAGE_S3_S3_FORCE_PATH_STYLE", value: "true"},
          ],
          "mariadb": {
            "auth": {
              "database": "directus",
              "username": mariaDBUsername,
              "password": mariaDBPassword,
              "rootPassword": mariaDBRootPassword
            }
          },
          "redis": {
            "auth": {
              "password": redisDBPassword
            }
          },


        },

      }
  );

}

export function createEtcd() {
  return new k8s.helm.v3.Chart("etcd", {
    chart: "etcd",
    namespace: namespaceEtcd.metadata.name,
    fetchOpts: {
      repo: "https://charts.bitnami.com/bitnami"
    },
    values: {
      "auth":
          {
            "rbac": {
              create: false,
              "existingSecret": etcdSecret.metadata.name,
              "existingSecretPasswordKey": "root-password"
            },
            client: {
              //secureTransport: true,
              //useAutoTLS: true
              //existingSecret: etcdSecret.metadata.name
            }
          },
      "persistence": {
        "storageClass":"local-path",
        "size": "3Gi"
      },
     nodeSelector: {
        owner: "bjoern"
     }

    }
  })
}

const runnerToken = process.env.RUNNER_REGISTRATION_TOKEN!
const runnerConfig = process.env.RUNNER_CONFIG!
export function createGitlabRunner() {
  return new k8s.helm.v3.Chart("gitlab-runner", {
    chart: "gitlab-runner",
    namespace: namespaceGitlab.metadata.name,
    fetchOpts: {
      repo: "https://charts.gitlab.io/"
    },
    values: {
      gitlabUrl: "https://gitlab.com",
      runnerRegistrationToken: runnerToken,

      nodeSelector: {
        owner: "bjoern"
      },
      rbac: {
        create: false,
        serviceAccountName: serviceAccount.metadata.name
      },
      runners: {
        config: runnerConfig,
        privileged: true
      }
    }
  })
}