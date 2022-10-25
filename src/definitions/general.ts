import {createDirectus} from "../resources/directus";
import {createPostgres} from "../resources/charts/Postgres";
import {createEtcd} from "../resources/charts/Etcd";
import {createGitlabRunner} from "../resources/charts/GitlabRunner";
import {
  createKubernetesCluster, directusS3Secret,
  etcdSecret, namespaceDirectus,
  namespaceEtcd,
  namespaceGitlab,
  namespacePostgres
} from "../resources/kubernetes";
import {adminMail, adminPassword} from "../util/env";


export const kubernetesCluster = createKubernetesCluster()


// Databases Setup
export const postgres = createPostgres(namespacePostgres)
export const etcd = createEtcd(namespaceEtcd, etcdSecret)
//export const redis = createRedis()

// Create Persistent Storages
//export const s3 = createS3()

// Create Gitlab Runner
export const gitlabRunner = createGitlabRunner(namespaceGitlab)

// Create apps for general usage
const directusConfig =  {namespace: namespaceDirectus, secret: directusS3Secret, vars:{ adminMail, adminPassword }}
export const directus = createDirectus("helm", directusConfig);

//export const plausible = createPlausible()