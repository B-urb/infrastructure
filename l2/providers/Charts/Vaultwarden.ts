import {Namespace} from "@pulumi/kubernetes/core/v1";
import * as k8s from "@pulumi/kubernetes";


export function createVaultwardenHelmchart() {

  const namespace = new Namespace("vaultwarden", {
    metadata: {
      name: "vaultwarden",
    }
  })

  return new k8s.helm.v4.Chart("bitwarden-rs", {
        chart: "bitwarden-rs",
        namespace: namespace.metadata.name,
        repositoryOpts: {
          repo: "https://charts.cronce.io/",
        },
        values: {
          "image": {
            "tag": "1.29.2-alpine"
          },
          "ingress": {
            "enabled": "true",
            "class": "traefik",
            "tls": [{
              "secretName": "vaultwarden" + "-legacy-tls",
              "hosts": ["warden.burbn.de"]
            }],
            "hosts": [
              {
                "paths": [
                  {
                    "pathType": "Prefix",
                    "path": "/"
                  }
                ],
                "host": "warden.burbn.de"
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