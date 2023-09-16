import * as pulumi from "@pulumi/pulumi";
import {createNamespace} from "./namespace";
import {createPostgres} from "./postgres";

import {RandomPassword} from "@pulumi/random";
import {Config, secret} from "@pulumi/pulumi";
import {Htpasswd, HtpasswdAlgorithm} from "pulumi-htpasswd";
import * as k8s from "@pulumi/kubernetes";
import {Secret} from "@pulumi/kubernetes/core/v1";
import {createSurrealManual} from "./providers/Manual/Surreal";
const namespacePostgres = createNamespace("postgres");
export const postgresNamespace = namespacePostgres.metadata.name
const namespaceEtcd = createNamespace("etcd")
const config = new Config()
 const dbRootPassword = new RandomPassword("postgresRootPassword", {
  length: 16,
  special: true,
});
const appDbPassword = new RandomPassword("applicationDBPassword", {
  length: 16,
  special: true,
});

// Databases Setup
// Postgres
const postgres = createPostgres("helm", namespacePostgres, dbRootPassword, appDbPassword)
export const postgresService = postgres.getResource("v1/Service", "postgres/postgres-postgresql")
postgresService.metadata.name.apply(value => pulumi.log.info(value))
export const postgresUrl = pulumi.interpolate`${postgresService.metadata.name}.${postgresService.metadata.namespace}`

// Surreal
createSurrealManual()



// const postgresProvider = new Provider("custom", {host: externalService.spec.externalIPs, port: externalService.spec.ports., password: dbRootPassword.result, username: "postgres"}, {dependsOn: postgres})
// const applicationDb = new Database("applications",{},{provider: postgresProvider});
// export const role = new Role("applicationDbAdmin", {login: true, password: password.result}, {provider: postgresProvider});
// const grant  = new Grant("applicationAdmin", {
//   database: applicationDb.name,
//   objectType: "database",
//   privileges: ["ALL"],
//   role: role.name,
// }, {provider: postgresProvider});
//TODO: check if we can export the role before assigning the grant


export const mailgunKey =  config.requireSecret("mailgunKey") //TODO: Replace with mailgunProvider

//export const etcdSecret = createEtcdSecret(env.etcdRootPassword, namespaceEtcd);
//const etcd = createEtcd(namespaceEtcd, etcdSecret)
//const redis = createRedis("helm",namespaceRedis);
export const postgresRootPassword = dbRootPassword.result


export function createBasicAuthSecret(user: string, password: string) {

  const credentials = new Htpasswd('credentials', {
    algorithm: HtpasswdAlgorithm.Bcrypt,
    entries: [{
      // example with a specific username + password
      username: user,
      password: password,
    }],
  });

  const authString = credentials.result

  return new k8s.core.v1.Secret("basic-auth", {
    metadata: {
      name: "basic-auth",
      namespace: "kube-system"
    },
    stringData: {
      "users": authString,
    }
  })
}

export function createMiddleware(secret: Secret) {
  return new k8s.apiextensions.CustomResource("middleware-ba", {
    apiVersion: "traefik.containo.us/v1alpha1",
    kind: "Middleware",
    metadata: {
      name: "basic-auth",
      namespace: "kube-system"
    },
    spec: {
      basicAuth: {
        secret: secret.metadata.name
      }
    }
  })
}


