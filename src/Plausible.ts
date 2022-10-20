import * as k8s from "@pulumi/kubernetes"
import {namespacePlausible} from "./namespace";
const plausibleImage = "docker pull plausible/analytics:stable"


const deployment () => {
  return new k8s.apps.v1.Deployment( "plausible-analytics",{
    metadata: {
      namespace: namespacePlausible.metadata.namespace
    },
    spec: {
      environment: {
      }
    }
  })
}