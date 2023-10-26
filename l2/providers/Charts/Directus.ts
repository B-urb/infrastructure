import * as k8s from "@pulumi/kubernetes"
import {ConfigMap, Namespace, Secret} from "@pulumi/kubernetes/core/v1";
import {directusSecret} from "../../secrets";
import {dbPassword, dbRootPassword} from "../../../util/env";




export function createDirectusHelmChart(namespace: Namespace, secret: Secret, config: ConfigMap) {

  return new k8s.helm.v3.Chart("directus-release", {
        chart: "directus",
        namespace: namespace.metadata.name,
        fetchOpts: {
          repo: "https://directus-community.github.io/helm-chart",
        },
        values: {
          "image": {
            //"repository":"registry.gitlab.com/privateprojectsbu/directus",
            "tag":"9.18.1",
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
              value: directusSecret["admin-mail"]
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
              value: directusSecret["admin-password"]
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
            {name: "STORAGE_S3_KEY", valueFrom: {secretKeyRef: {name:secret.metadata.name, key:"s3-user-key"}}},
            {name: "STORAGE_S3_SECRET", valueFrom: {secretKeyRef: {name: secret.metadata.name, key:"s3-user-secret"}}},
            {name: "STORAGE_S3_BUCKET", value: "directus"},
            {name: "STORAGE_S3_S3_FORCE_PATH_STYLE", value: "true"},
          ],
          "mariadb": {
            enabled: true, // manage creation in pulumi not via directus helm chart
            "auth": {
              "database": "directus",
              "username": "directus",
              "password": dbPassword,
              "rootPassword": dbRootPassword // TODO: Remove
            }
          },
          "redis": {
            enabled: false, // manage creation in pulumi not via directus helm chart
        /*   "auth": {
              "password": redisDBPassword
            }*/
          },
        },
      }
  );

}


