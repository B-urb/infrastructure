import * as pulumi from "@pulumi/pulumi";
import {createNamespace} from "./namespace";
import {createPostgres} from "./postgres";
import {createEtcd} from "./providers/charts/Etcd";
import {createRedis} from "./redis";
import * as k8s from "@pulumi/kubernetes";
import {
  createBasicAuthSecret,
  createEtcdSecret,
  createGitlabSecret,
  createMiddleware
} from "../src/resources/kubernetes/Secrets";
import * as env from "../util/env";
import {RandomPassword} from "@pulumi/random";
import {Database, Grant, Provider, Role, Schema} from "@pulumi/postgresql";
import {Config, secret} from "@pulumi/pulumi";
const namespacePostgres = createNamespace("postgres");
const namespaceEtcd = createNamespace("etcd")
//const namespaceRedis = createNamespace("redis")
//const baSecret = createBasicAuthSecret(env.basicAuthUser, env.basicAuthPassword);
//const middleware = createMiddleware(baSecret)
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
const postgres = createPostgres("helm", namespacePostgres, dbRootPassword, appDbPassword)


export const postgresService = postgres.getResource("v1/Service", "postgres/postgres-postgresql")
postgresService.metadata.name.apply(value => pulumi.log.info(value))
export const postgresUrl = pulumi.interpolate`${postgresService.metadata.name}.${postgresService.metadata.namespace}`





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


