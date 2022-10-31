import * as k8s from "@pulumi/kubernetes"
import {Namespace} from "@pulumi/kubernetes/core/v1";

const plausibleImage = "docker pull plausible/analytics:stable"


export function createPlausible() {


}


function createPlausibleManual(namespace: Namespace) {
  const deployment = new k8s.apps.v1.Deployment("plausible-analytics", {
    metadata: {
      namespace: namespace.metadata.namespace
    },
    "spec": {
      "strategy": {
        "type": "Recreate"
      },
    }
  })


  return {deployment};

}
