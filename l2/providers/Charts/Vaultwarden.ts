import {Namespace} from "@pulumi/kubernetes/core/v1";
import * as k8s from "@pulumi/kubernetes";


export function createVaultwardenHelmchart() {

  const namespace = new Namespace("vaultwarden", {
    metadata: {
      name: "vaultwarden",
    }
  })

  return new k8s.helm.v3.Chart("bitwarden-rs", {
        chart: "bitwarden-rs",
        namespace: namespace.metadata.name,
        fetchOpts: {
          repo: "https://charts.cronce.io/",
        },
        values: {
          "ingress": {
            "enabled": "true",
            "class": "none",
            "tls": [{
              "secretName": "vaultwarden" + "-legacy-tls",
              "hosts": ["passwords.burban.me"]
            }],
            "hosts": [
              {
                "paths": [
                  {
                    "pathType": "Prefix",
                    "path": "/"
                  }
                ],
                "host": 'passwords.burban.me'
              }],
            "annotations": {
              "kubernetes.io/ingress.class": "traefik",
              "cert-manager.io/cluster-issuer": "letsencrypt"
            }
          },
          "persistence": {
            "size": "4Gi"
          }
        },
      }
  );

}