import {createNamespace} from "./namespace";
import {
  createBasicAuthSecret, createDbSecret,
  createDirectusS3Secret,
  createEtcdSecret, createGitlabSecret,
  createMiddleware
} from "./Secrets";
import * as env from "../../util/env"

export const namespacePostgres = createNamespace("postgres");
export const namespaceDirectus = createNamespace("directus")
export const namespaceEtcd = createNamespace("etcd")
export const namespaceGitlab = createNamespace("gitlab")
export const namespaceMariaDB = createNamespace("mariadb")

const baSecret = createBasicAuthSecret(env.basicAuthUser, env.basicAuthPassword);
const middleware = createMiddleware(baSecret)

const dbSecret = createDbSecret(env.dbUsername, env.dbPassword, "directus-db-secret", namespaceDirectus)

export const etcdSecret = createEtcdSecret(env.etcdRootPassword, namespaceEtcd);
export const gitlabSecretDi = createGitlabSecret("pulumi", env.pullSecret, "gitlab-pull-secret-directus", namespaceDirectus);

export function createKubernetesCluster() {
return "cluster konfig";
}