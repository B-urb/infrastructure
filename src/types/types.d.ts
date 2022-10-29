import {ConfigMap, Namespace, Secret} from "@pulumi/kubernetes/core/v1";

export type Source = "helm" | "aws" | "manual" | "gke" | "azure"

export interface DirectusConfig  {
  namespace: Namespace;
  secret: Secret;
  config: ConfigMap;
}
