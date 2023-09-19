import * as k8s from "@pulumi/kubernetes"
import {getEnv} from "@pulumi/kubernetes/utilities";
import {WebService} from "../../types/WebService";
import {Deployment} from "@pulumi/kubernetes/apps/v1";
import {ConfigMap, Namespace, Secret} from "@pulumi/kubernetes/core/v1";
import {keelAnnotationsProd} from "../../../util/globals";

export function createVaultwardenManual(namespace: Namespace) {
  const website =  new WebService("vaultwarden", "warden.tecios.de", namespace, "vaultwarden/server", "1.29.2-alpine", {}, "prod");

  const deployment = createVaultwardenDeployments(website);
  const service = createVaultwardenService(website);
  const ingress = createVaultwardenIngress(website);
}
function createVaultwardenDeployments(website: WebService): Deployment {
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
        ...keelAnnotationsProd

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
          // nodeSelector: {
          // },
          "containers": [
            {
              "name": website.name,
              "image": website.registryImage + ":" + website.imageTag,
              "imagePullPolicy": "Always",
              "env": [

              ],
              "ports": [
                {
                  "name": "http",
                  "containerPort": 80
                },],
              "livenessProbe": {
                httpGet: {
                  path: "/",
                  port: "http"
                }
              },
              readinessProbe: {
                httpGet: {
                  path: "/",
                  port: "http"
                }
              }
            }
          ],
        }

      }
    }
  })
}
function createVaultwardenService(webservice: WebService): k8s.core.v1.Service {

  return new k8s.core.v1.Service(webservice.name, {
        "metadata": {
          name: webservice.name,
          namespace: webservice.namespace.metadata.name
        },
        "spec": {
          "ports": [
            {
              "name": "http",
              "port": 80,
              "protocol": "TCP",
              "targetPort": "http"
            }
          ],
          "selector": {
            "name": webservice.name
          }
        }
      });
}
function createVaultwardenIngress(webservice: WebService): k8s.networking.v1.Ingress {

  return new k8s.networking.v1.Ingress(webservice.name, {
        metadata: {
          annotations: {
            "kubernetes.io/ingress.class": "traefik",
            "cert-manager.io/cluster-issuer": "letsencrypt",
            ...webservice.ingressAnnotations
          },
          namespace: webservice.namespace.metadata.name
        },

        spec: {
          tls: [{
            secretName: webservice.name + "-tls",
            hosts: [webservice.url]
          }],
          rules: [
            {
              host: webservice.url,
              http: {
                paths: [{
                  pathType: "Prefix",
                  path: "/",
                  backend: {service: {name: webservice.name, port:{number: 80 }}}
                }]
              }
            }]

        }
      }
  );
}