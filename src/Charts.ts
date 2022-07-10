import * as k8s from "@pulumi/kubernetes"

const adminPassword = process.env.CI_ADMIN_PASSWORD
const adminMail = process.env.CI_ADMIN_EMAIL
export function createDirectus() {

  return new k8s.helm.v3.Chart("directus-release", {
        chart: "directus",
        namespace: "burban",
        fetchOpts: {
          repo: "https://directus-community.github.io/helm-chart",
        }, values: {
          "image": {
            "tag":"9.12.2"
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
              name:"CONTENT_SECURITY_POLICY_DIRECTIVES__SCRIPT_SRC_ATTR",
              value: "null"
            },
            {
              name:"CORS_ENABLED",
              value: "true"
            },
            {
              name:"CORS_ORIGIN",
              value: "https://burban.me,https://dev.burban.me"
            },
            {
              name: "ADMIN_PASSWORD",
              value: adminPassword
            }
          ]

        }

      }
  );

}
