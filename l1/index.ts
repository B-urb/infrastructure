import * as pulumi from "@pulumi/pulumi";
import {createNamespace} from "../util/namespace";
import {createPostgres} from "./postgres";
import {createEtcd} from "./providers/charts/Etcd";
import {createRedis} from "./redis";
import {
  createBasicAuthSecret,
  createEtcdSecret,
  createGitlabSecret,
  createMiddleware
} from "../src/resources/kubernetes/Secrets";
import * as env from "../util/env";
export const namespacePostgres = createNamespace("postgres");
export const namespaceEtcd = createNamespace("etcd")
export const namespaceMariaDB = createNamespace("mariadb")
export const namespaceRedis = createNamespace("redis")
const baSecret = createBasicAuthSecret(env.basicAuthUser, env.basicAuthPassword);
const middleware = createMiddleware(baSecret)


export const etcdSecret = createEtcdSecret(env.etcdRootPassword, namespaceEtcd);
// Databases Setup
const postgres = createPostgres("helm", namespacePostgres)
const etcd = createEtcd(namespaceEtcd, etcdSecret)
const redis = createRedis("helm",namespaceRedis);
