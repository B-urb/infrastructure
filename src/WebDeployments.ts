import * as k8s from "@pulumi/kubernetes"
import {getEnv} from "@pulumi/kubernetes/utilities";
import {WebService} from "./types/WebService";

const env = getEnv("development")



export function createDeployments(resources : Array<WebService> ) : Array<k8s.apps.v1.Deployment>{
const appLabels = {};
  return resources.map(website =>
    new k8s.apps.v1.Deployment(website.name + "-" + env, {
      metadata: {
        labels: {
          name: website.name
        },
        "annotations": {
          "keel.sh/policy": "force",
          "keel.sh/trigger": "poll",
          "keel.sh/pollSchedule": "@hourly"
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
            "image": "ghost:alpine",
            "env": [
              {
                "name": "url",
                "value": website.url
              }
            ],
            "volumeMounts": [
              {
                "mountPath": "/var/lib/ghost/content",
                "name": "data"
              }
            ],
            "ports": [
              {
                "name": "http",
                "containerPort": 2368
              }
            ]
          }
        ],
            "nodeSelector": {
          "storage": "openstack"
        },
        "volumes": [
          {
            "name": "data",
            "persistentVolumeClaim": {
              "claimName": "daniel",
              "readOnly": false
            }
          }
        ]
      }
    }
  }
  }
    }));
}

