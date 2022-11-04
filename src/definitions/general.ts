import {createDirectus} from "../resources/directus";
import {createEtcd} from "../resources/charts/Etcd";
import {createGitlabRunner} from "../resources/charts/GitlabRunner";
import {
  createKubernetesCluster,
  etcdSecret, namespaceDirectus,
  namespaceEtcd,
  namespaceGitlab, namespaceMedusa,
  namespacePostgres, namespaceRedis, namespaceUmami
} from "../resources/kubernetes";
import {createDirectusSecret, createMedusaSecret, createUmamiSecret} from "../resources/kubernetes/Secrets";
import {createDirectusConfig} from "../resources/kubernetes/ConfigMap";
import {createPostgres} from "../resources/postgres";
import {createUmami} from "../resources/umami";
import {createRedis} from "../resources/redis";
import {createMedusa} from "../resources/medusa";

export function createGeneral() {
  const kubernetesCluster = createKubernetesCluster()


// Databases Setup
  const postgres = createPostgres("helm", namespacePostgres)
  const etcd = createEtcd(namespaceEtcd, etcdSecret)
  const redis = createRedis("helm",namespaceRedis);

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
  const dirHelm = createDirectus("helm", directusConfig)
  createUmami("manual", namespaceUmami, createUmamiSecret(namespaceUmami))
  createMedusa("manual", namespaceMedusa, createMedusaSecret(namespaceMedusa))

//export const plausible = createPlausible()
}