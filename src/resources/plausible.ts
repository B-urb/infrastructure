import * as k8s from "@pulumi/kubernetes"
import {namespacePlausible} from "./kubernetes/namespace";

const plausibleImage = "docker pull plausible/analytics:stable"


export function createPlausible() {


}


function createPlausibleManual() {
  const deployment = new k8s.apps.v1.Deployment("plausible-analytics", {
    metadata: {
      namespace: namespacePlausible.metadata.namespace
    },
    spec: {
      environment: {}
    }
  })


  return {deployment};

}
