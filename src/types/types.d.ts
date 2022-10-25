import {Namespace, Secret} from "@pulumi/kubernetes/core/v1";

export type Source = "helm" | "aws" | "manual" | "gke" | "azure"

interface DirectusVars {
  adminMail: string;
  adminPassword: string;
}

export interface DirectusConfig  {
  namespace: Namespace;
  secret: Secret;
  vars: DirectusVars;
}
