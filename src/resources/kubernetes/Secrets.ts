import * as k8s from "@pulumi/kubernetes";
import {Htpasswd, HtpasswdAlgorithm} from "pulumi-htpasswd";
import {Namespace, Secret} from "@pulumi/kubernetes/core/v1";
import {backupSecret, medusaSecret } from "../../../l2/secrets";
import * as pulumi from "@pulumi/pulumi"



export function createBackupSecret(namespace: Namespace) {
  return new k8s.core.v1.Secret("postgres-backup", {
    metadata: {
      name: "postgres-backup",
      namespace: namespace.metadata.name
    },
    stringData: backupSecret
  })
}

export function createMedusaSecret(namespace: Namespace) {
  return new k8s.core.v1.Secret("medusa", {
    metadata: {
      name: "medusa",
      namespace: namespace.metadata.name
    },
    stringData: medusaSecret
  })
}
export function createEtcdSecret(rootPassword: string, namespace: Namespace) {
  return new k8s.core.v1.Secret("etcd", {
    metadata: {
      name: "etcd",
      namespace: namespace.metadata.name
    },
    stringData: {
      "root-password": rootPassword
    }
  })
}

export function createDbSecret(user: string, password: string, name: string, namespace: Namespace) {
  return new k8s.core.v1.Secret(name, {
    metadata: {
      name: name,
      namespace: namespace.metadata.name
    },
    stringData: {
      "user": user,
      "password": password
    }
  })
}







