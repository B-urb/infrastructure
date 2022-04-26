import * as k8s from "@pulumi/kubernetes"
import {getEnv} from "@pulumi/kubernetes/utilities";
import {WebService} from "./WebService";

const env = getEnv("development")



export function createDeployments(resources : Array<WebService> ) : Array<k8s.apps.v1.Deployment>{
const appLabels = {};
  return resources.map(website =>
    new k8s.apps.v1.Deployment(website.name + "-" + env, {
      spec: {
        selector: {matchLabels: appLabels},
        replicas: -1,
        template: {
          metadata: {labels: appLabels},
          spec: {containers: [{name: "nginx", image: "nginx"}]}
        }
      }
    }));
}

