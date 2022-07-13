import * as k8s from "@pulumi/kubernetes"
import {createSecretKey} from "crypto";
import {CustomResourceOptions} from "@pulumi/pulumi";

const adminPassword = process.env.CI_ADMIN_PASSWORD
const adminMail = process.env.CI_ADMIN_EMAIL
const mariaDBPassword = process.env.CI_DB_PASSWORD
const mariaDBUsername = process.env.CI_DB_USERNAME

export function createDirectus() {

  return new k8s.helm.v3.Chart("directus-release", {
        chart: "directus",
        namespace: "burban",
        fetchOpts: {
          repo: "https://directus-community.github.io/helm-chart",
        },
        values: {
          "image": {
            "tag": "9.12.2"
          },
          "ingress": {
            "enabled": "true",
            "tls": [{
              "secretName": "directus" + "-tls",
              "hosts": ["cms.burban.me"]
            }],
            "hosts": [
              {
                "paths": [
                  {
                    "pathType": "Prefix",
                    "path": "/"
                  }
                ],
                "host": 'cms.burban.me'
              }],
            "annotations": {
              "kubernetes.io/ingress.class": "traefik",
              "cert-manager.io/cluster-issuer": "letsencrypt"
            }
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
              value: "array:'self',https://cms.burban.me"
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
              value: "https://burban.me,https://dev.burban.me"
            },
            {
              name: "ADMIN_PASSWORD",
              value: adminPassword
            },
            {name: "DB_CLIENT", value: "mysql"},
            {name: "DB_HOST", value: "https://directus-release-mariadb"},
            {name: "DB_PORT", value: "3306"},
            {name: "DB_PASSWORD", valueFrom: {secretKeyRef: {name:"directus-release-mariadb", key: "password"}}},
            {name: "DB_USER", value: "directus"},
            {name: "DB_DATABASE", value: "directus"}
            // etc
          ],
          "mariadb": {
            "auth": {
              "database": "directus",
              "username": mariaDBUsername,
              "password": mariaDBPassword
            }
          }

        },

      }
  );

}
