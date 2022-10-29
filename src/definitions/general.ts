import {createDirectus} from "../resources/directus";
import {createEtcd} from "../resources/charts/Etcd";
import {createGitlabRunner} from "../resources/charts/GitlabRunner";
import {
  createKubernetesCluster,
  etcdSecret, namespaceDirectus,
  namespaceEtcd,
  namespaceGitlab,
  namespacePostgres
} from "../resources/kubernetes";
import {createDirectusSecret} from "../resources/kubernetes/Secrets";
import {createDirectusConfig} from "../resources/kubernetes/ConfigMap";
import {createPostgres} from "../resources/postgres";

export function createGeneral() {
  const kubernetesCluster = createKubernetesCluster()


// Databases Setup
  const postgres = createPostgres("helm", namespacePostgres)
  const etcd = createEtcd(namespaceEtcd, etcdSecret)
//export const redis = createRedis()

// Create Persistent Storages
//export const s3 = createS3()

// Create Gitlab Runner
  const gitlabRunner = createGitlabRunner(namespaceGitlab)

// Create apps for general usage
  const directusConfig = {
    namespace: namespaceDirectus,
    secret: createDirectusSecret("directus", namespaceDirectus),
    config: createDirectusConfig()
  }
  const directus = createDirectus("manual", directusConfig);

//export const plausible = createPlausible()
}