import * as k8s from "@pulumi/kubernetes"
import {getEnv} from "@pulumi/kubernetes/utilities";
import {WebService} from "./types/WebService";
import {secret} from "@pulumi/pulumi";
import { gitlabSecret} from "./Secrets";


const env = getEnv("development")


export function createDeployments(resources: Array<WebService>): Array<k8s.apps.v1.Deployment> {
  const appLabels = {};
  return resources.map(website =>
      new k8s.apps.v1.Deployment(website.name, {
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
              "containers": [
                {
                  "name": website.name,
                  "image": website.registryImage + ":" + website.imageTag,
                  "imagePullPolicy": "Always",
                  "env": [
                    {
                      "name": "url",
                      "value": website.url
                    }
                  ],
                  "ports": [
                    {
                      "name": "http",
                      "containerPort": 3000
                    }
                  ]
                }
              ],
              imagePullSecrets: [
                {"name": gitlabSecret.metadata.name}
              ]

            }
          }
        }

      }));
}

