import * as k8s from "@pulumi/kubernetes"

const adminPassword = process.env.CI_ADMIN_PASSWORD
const adminMail = process.env.CI_ADMIN_MAIL
export function createDirectus() {

  return new k8s.helm.v2.Chart("directus-release", {
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
              name: "ADMIN_PASSWORD",
              value: adminPassword
            }
          ]

        }

      }
  );

}
