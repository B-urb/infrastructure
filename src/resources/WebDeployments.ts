import * as k8s from "@pulumi/kubernetes"
import {getEnv} from "@pulumi/kubernetes/utilities";
import {WebService} from "../types/WebService";
import {keelAnnotationsDev, keelAnnotationsExp, keelAnnotationsProd} from "../util/globals";
import {gitlabSecretDi} from "./kubernetes";



const env = getEnv("development")


export function createDeployments(resources: Array<WebService>): Array<k8s.apps.v1.Deployment> {
  const appLabels = {};
  return resources.map(website => {
    let keelAnnotations = {};
    switch (website.stage) {
      case "prod":
        keelAnnotations = keelAnnotationsProd
        break
      case "dev":
        keelAnnotations = keelAnnotationsDev
        break
      case "experimental":
        keelAnnotations = keelAnnotationsExp
    }
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
          ...keelAnnotations


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
              {"name": "gitlab-pull-secret-" + website.namespace.metadata.name}
            ]

          }
        }
      }
    })
  })
}


