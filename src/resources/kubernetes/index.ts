import {createNamespace} from "./namespace";
import {
  createBasicAuthSecret,
  createDirectusS3Secret,
  createEtcdSecret, createGitlabSecret, createGitlabSecretBahrenberg,
  createMariaDBBackupSecret,
  createMiddleware
} from "./Secrets";
import * as env from "../../util/env"

export const namespacePostgres = createNamespace("postgres");
export const namespacePlausible = createNamespace("plausible");
export const namespaceClickhouse = createNamespace("clickhouse");
export const namespaceBurban = createNamespace("burban")
export const namespaceDirectus = createNamespace("directus")
export const namespaceEtcd = createNamespace("etcd")
export const namespaceGitlab = createNamespace("gitlab")
export const namespaceBahrenberg = createNamespace("bahrenberg")
export const namespaceMariaDB = createNamespace("mariadb")



const baSecret = createBasicAuthSecret(env.basicAuthUser, env.basicAuthPassword);
const middleware = createMiddleware(baSecret)

export const etcdSecret = createEtcdSecret(env.etcdRootPassword, namespaceEtcd);
export const mariaDbBackupSecret = createMariaDBBackupSecret(env.mariaDBBackupUser, env.mariaDBBackupPassword, namespaceMariaDB);
export const directusS3Secret = createDirectusS3Secret(env.s3UserKey, env.s3UserSecret, namespaceDirectus);
export const gitlabSecret = createGitlabSecret("pulumi", env.pullSecret, namespaceBurban);
export const bahrenbergGitlab = createGitlabSecretBahrenberg("pulumi", env.pullSecret, namespaceBahrenberg)


export function createKubernetesCluster() {

}