import { createDirectus } from "./directus";
import { createNamespace } from "./namespace";
import { createUmami } from "./umami";
import { createDirectusConfigMap } from "./configs";
import { DirectusConfig } from "../util/types";
import * as postgresql from "@pulumi/postgresql";
import { Provider, Role } from "@pulumi/postgresql";
import { RandomPassword } from "@pulumi/random";
import { Config, getStack, interpolate, jsonParse, log, Output, StackReference } from "@pulumi/pulumi";
import { createBackupSecret, createDirectusSecret, createUmamiSecret } from "./secrets";
import {ConfigMap, Secret} from "@pulumi/kubernetes/core/v1";
import createBackupCronjob from "./CronJob";
import {createVaultwardenHelmchart} from "./providers/Charts/Vaultwarden";
import {createVaultwardenManual} from "./providers/Manual/Vaultwarden";

const config = new Config();
const stack = getStack();
const org = config.require("org");

const stackRef = new StackReference(`${org}/l1/${stack}`)



const password = new RandomPassword("directusDbPassword", {
  length: 16,
  special: true,
});
const postgresNamespace = stackRef.getOutput("postgresNamespace").apply(namespace => interpolate`${namespace}`)
//Initialize Postgres Provider. NOTE: Requires port-forward for now
const dbAuthPassword = stackRef.getOutput("postgresRootPassword").apply(authPW => interpolate`${authPW}`)
const mailgunKey = stackRef.getOutput("mailgunKey").apply(authPW => interpolate`${authPW}`)
const postgresUrl = stackRef.getOutput("postgresUrl").apply(url => interpolate`${url}`)




const postgresProvider = new Provider("custom", { host: postgresUrl, password: dbAuthPassword, username: "postgres", sslmode: "disable" })

// Create Backup for Database
const backupPGPassword = new RandomPassword("backupPGPassword", {
  length: 16,
  special: true,
});
const backupRole = new Role("backup", { login: true, name: "backup", password: backupPGPassword.result, superuser: true, replication: true }, { provider: postgresProvider });
const backUpSecret = {
  "db-user": backupRole.name,
  "db-password": backupPGPassword.result,
  "s3-user-key": config.get("s3-key")!!,
  "s3-user-secret": config.get("s3-secret")!!,
}

createBackupCronjob(postgresNamespace, createBackupSecret(postgresNamespace, backUpSecret))
export const backupPassword = backupPGPassword.result

function createDBCredentials(ident: string) {
  const password = new RandomPassword(`${ident}DBPassword`, {
    length: 26,
    special: false,
  });
  const db = new postgresql.Database(ident, { name: ident }, { provider: postgresProvider });

  const role = new Role(ident, { login: true, name: ident, password: password.result }, { provider: postgresProvider });
  new postgresql.Grant(`${ident}Full`, {
    database: db.name,
    objectType: "database",
    privileges: ["ALL"],
    role: role.name,
  }, { provider: postgresProvider });

  return {
    user: role.name,
    password: password.result,
    db: db.name,
  }
}

// Create Database for DirectusCMS
const directusDb = new postgresql.Database("directus", { name: "directus" }, { provider: postgresProvider });
const role = new Role("directus", { login: true, name: "directus", password: password.result }, { provider: postgresProvider });
const grant = new postgresql.Grant("directusFull", {
  database: directusDb.name,
  objectType: "database",
  privileges: ["ALL"],
  role: role.name,
}, { provider: postgresProvider });

const umamiCredentials = createDBCredentials("umami")
const vaultwardenCredentials = createDBCredentials("vaultwarden")


const lycheeIdent = "lychee"
const lycheeCredentials = createDBCredentials(lycheeIdent)
const lycheeNS = createNamespace(lycheeIdent)

new Secret(lycheeIdent, {
  metadata: {
    name: `db-credentials`,
    namespace: lycheeNS.metadata.name,
  },
  type: "Opaque",
  stringData: { ...lycheeCredentials },
})

// Create apps for general usage
//export const namespaceMedusa = createNamespace("medusa")
export const namespaceUmami = createNamespace("umami")
export const namespaceDirectus = createNamespace("directus")


export const adminPassword = new RandomPassword("admin-password", { length: 19, special: true }).result.apply(
  password => interpolate`${password}`
)
const directusSecretKey = new RandomPassword("directus-secret", { length: 24 }).result.apply(
  password => interpolate`${password}`
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
  "db-host": postgresUrl,
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
  "db-connection-string": interpolate`postgresql://${umamiCredentials.user}:${umamiCredentials.password}@${postgresUrl}:5432/${umamiCredentials.db}`
}
createUmami("manual", namespaceUmami, createUmamiSecret(namespaceUmami, umamiSecret))

export const vaultwardenSecret = {
  "database-url": interpolate`postgresql://${vaultwardenCredentials.user}:${vaultwardenCredentials.password}@${postgresUrl}:5432/${vaultwardenCredentials.db}`
}
const vaultwardenNamespace = createNamespace("vaultwarden")
const configMap = new ConfigMap("vaultwarden", {metadata: {namespace: vaultwardenNamespace.metadata.name},data: {}})
createVaultwardenManual(vaultwardenNamespace,configMap, vaultwardenSecret)
