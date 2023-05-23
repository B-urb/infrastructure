import {createDirectus} from "./directus";
import {createDirectusSecret, createGitlabSecret, createUmamiSecret} from "../src/resources/kubernetes/Secrets";
import {createNamespace} from "../util/namespace";
import * as k8s from "@pulumi/kubernetes";
import {createUmami} from "./umami";
import {directusConfigMapData} from "./configs";
import {ConfigMap} from "@pulumi/kubernetes/core/v1";
import {DirectusConfig} from "../util/types";
import * as env from "../util/env";
import * as postgresql from "@pulumi/postgresql";
import {Role} from "@pulumi/postgresql";

const myDb = new postgresql.Database("my-database");
const role = new Role("directus", {createDatabase});
// Create apps for general usage
export const namespaceMedusa = createNamespace("medusa")
export const namespaceUmami = createNamespace("umami")
export const namespaceDirectus = createNamespace("directus")
export const gitlabSecretDi = createGitlabSecret("pulumi", env.pullSecret, "gitlab-pull-secret-directus", namespaceDirectus);

const directusConfigMap = new k8s.core.v1.ConfigMap("directus", {
    metadata: {
      namespace: "directus",
      name: "directus"
    },
    data: directusConfigMapData
  });

const directusConfig: DirectusConfig = {
  namespace: namespaceDirectus,
  secret: createDirectusSecret("directus", namespaceDirectus),
  config: directusConfigMap
}
const directus = createDirectus("manual", directusConfig);
//const dirHelm = createDirectus("helm", directusConfig)
createUmami("manual", namespaceUmami, createUmamiSecret(namespaceUmami))
//createMedusa("manual", namespaceMedusa, createMedusaSecret(namespaceMedusa))
//export const plausible = createPlausible()
