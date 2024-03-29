import {
  adminMail,
  adminPassword, dbBackupPassword,
  dbBackupUser,
  dbPassword,
  dbUsername,
  mailgunKey, medusaPassword, medusaUser, redisDBPassword,
  s3UserKey,
  s3UserSecret, umamiPassword, umamiUser
} from "../util/env";
import {Namespace} from "@pulumi/kubernetes/core/v1";
import * as k8s from "@pulumi/kubernetes";
import {DirectusSecret, UmamiSecret} from "../util/types";
import {Input, Output} from "@pulumi/pulumi";


export const directusSecret = {
  "db-user": dbUsername,
  "db-password": dbPassword,
  "admin-mail": adminMail,
  "admin-password": adminPassword,
  "db-name": "directus",
  "s3-user-key": s3UserKey,
  "s3-user-secret": s3UserSecret,
  "mg-api-key": mailgunKey,
  "directus-secret": "test"
}
export const backupSecret = {
  "db-user": dbBackupUser,
  "db-password": dbBackupPassword,
  "s3-user-key": s3UserKey,
  "s3-user-secret": s3UserSecret,
}

export const medusaSecret = {
  "postgres-connection-string": `postgresql://${medusaUser}:${medusaPassword}@postgres-postgresql.postgres:5432/medusa`,
  "redis-connection-string": `redis://redis-headless.redis:6379?ConnectTimeout=5000&password=${redisDBPassword}&IdleTimeOutSecs=180`
}
export function createBackupSecret(namespace: Input<string>, backupSecretData: Input<{[key: string]: Input<string>}>) {
  return new k8s.core.v1.Secret("postgres-backup", {
    metadata: {
      name: "postgres-backup",
      namespace: namespace
    },
    stringData: backupSecretData
  })
}
export function createUmamiSecret(namespace: Namespace, umamiSecret: Input<{[key: string]: Input<string>}> ) {
  return new k8s.core.v1.Secret("umami", {
    metadata: {
      name: "umami",
      namespace: namespace.metadata.name
    },
    stringData: umamiSecret
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
export function createDirectusSecret(name: string, namespace: Namespace, directusSecret: Input<{[key: string]:  Input<string>}> ) {
  return new k8s.core.v1.Secret("directus", {
    metadata: {
      name: name,
      namespace: namespace.metadata.name
    },
    stringData: directusSecret
  })
}

export function createSecretWrapper(name: string, namespace: Namespace, secretData: Input<{[key: string]:  Input<string>}> ) {
  return new k8s.core.v1.Secret(name, {
    metadata: {
      name: name,
      namespace: namespace.metadata.name
    },
    stringData: secretData
  })
}