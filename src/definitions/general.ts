import {createDirectus} from "../resources/directus";
import {createPostgres} from "../resources/charts/Postgres";
import {createPlausible} from "../resources/plausible";
import {createEtcd} from "../resources/charts/Etcd";
import {createGitlabRunner} from "../resources/charts/GitlabRunner";


export const kubernetesCluster = createKubernetesCluster()


// Databases Setup
export const postgres = createPostgres()
export const etcd = createEtcd()
export const redis = createRedis()

// Create Persistent Storages
export const s3 = createS3()

// Create Gitlab Runner
export const gitlabRunner = createGitlabRunner()

// Create apps for general usage
export const directus = createDirectus("helm");
export const plausible = createPlausible()