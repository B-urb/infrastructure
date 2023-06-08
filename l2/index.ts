import {createDirectus} from "./directus";
import { createGitlabSecret } from "../src/resources/kubernetes/Secrets";
import {createNamespace} from "../l0/namespace";
import * as k8s from "@pulumi/kubernetes";
import {createUmami} from "./umami";
import {createDirectusConfigMap } from "./configs";
import {DirectusConfig} from "../util/types";
import * as env from "../util/env";
import * as postgresql from "@pulumi/postgresql";
import {Provider, Role} from "@pulumi/postgresql";
import {RandomPassword} from "@pulumi/random";
import {Config, getStack, Input, interpolate, log, StackReference} from "@pulumi/pulumi";
import {createDirectusSecret, createUmamiSecret} from "./secrets";

const config = new Config();
const stack = getStack();
const org = config.require("org");

const stackRef = new StackReference(`${org}/l1/${stack}`)



const password = new RandomPassword("directusDbPassword", {
  length: 16,
  special: true,
});

//Initialize Postgres Provider. NOTE: Requires port-forward for now
const dbAuthPassword = stackRef.getOutput("postgresRootPassword").apply(authPW => interpolate `${authPW}`)
const mailgunKey = stackRef.getOutput("mailgunKey").apply(authPW => interpolate `${authPW}`)

const postgresProvider = new Provider("custom", {host: "localhost", password: dbAuthPassword, username: "postgres", sslmode:"disable"})

// Create Database for DirectusCMS
const directusDb = new postgresql.Database("directus", {name: "directus"},{provider:postgresProvider});
const role = new Role("directus", {login: true, name: "directus", password: password.result}, {provider:postgresProvider});
const grant  = new postgresql.Grant("directusFull", {
  database: directusDb.name,
  objectType: "database",
  privileges: ["ALL"],
  role: role.name,
}, {provider:postgresProvider});


//Create Database for umami
const umamiPassword = new RandomPassword("umamiDBPassword", {
  length: 26,
  special: false,
});
const umamiDb = new postgresql.Database("umami", {name: "umami"},{provider:postgresProvider});

const umamiRole = new Role("umami", {login: true,name:"umami", password: umamiPassword.result}, {provider:postgresProvider});
const umami  = new postgresql.Grant("umamiFull", {
  database: umamiDb.name,
  objectType: "database",
  privileges: ["ALL"],
  role: umamiRole.name,
}, {provider:postgresProvider});




// Create apps for general usage
export const namespaceMedusa = createNamespace("medusa")
export const namespaceUmami = createNamespace("umami")
export const namespaceDirectus = createNamespace("directus")
export const gitlabSecretDi = createGitlabSecret("pulumi", env.pullSecret, "gitlab-pull-secret-directus", namespaceDirectus);


export const adminPassword = new RandomPassword("admin-password", {length: 19, special: true}).result.apply(
    password => interpolate `${password}`
)
const directusSecretKey = new RandomPassword("directus-secret", {length: 24}).result.apply(
    password => interpolate `${password}`
)
 const directusSecret = {
  "db-user": role.name,
  "db-password": password.result,
  "admin-mail": config.get("admin-mail")!!,
  "admin-password": adminPassword,
  "db-name": "directus",
  "s3-user-key": config.get("s3-key")!!,
  "s3-user-secret": config.get("s3-secret")!!,
  "mg-api-key": mailgunKey,
  "directus-secret": directusSecretKey
}
export const directusConfigMapData = {
  PUBLIC_URL: "https://cms.tecios.de",
  "db-client": "pg",
  "db-host": "postgres-postgresql.postgres",
  "db-port": "5432",
  "s3-bucket": "directus",
  "directus-key": "bjoern"

}
const directusConfig: DirectusConfig = {
  namespace: namespaceDirectus,
  secret: createDirectusSecret("directus", namespaceDirectus, directusSecret),
  config: createDirectusConfigMap(directusConfigMapData)
}
const directus = createDirectus("manual", directusConfig);
export const umamiSecret = {
  "db-connection-string": interpolate `postgresql://${umamiRole.name}:${umamiPassword.result}@postgres-postgresql.postgres:5432/${umamiDb.name}`
}
createUmami("manual", namespaceUmami, createUmamiSecret(namespaceUmami, umamiSecret))
//createMedusa("manual", namespaceMedusa, createMedusaSecret(namespaceMedusa))
//export const plausible = createPlausible()
