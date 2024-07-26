import {Provider, Role, Database, Grant} from "@pulumi/postgresql";
import {Config, interpolate, StackReference} from "@pulumi/pulumi";
import {RandomPassword} from "@pulumi/random";
import {createNamespace} from "../namespace";
import {createKubevoyageHelmChart, KubevoyageConfig} from "../providers/Charts/Kubevoyage";


export function createKubevoyage(postgresProvider: Provider, stackRef: StackReference, config: Config) {
  const jwtSecret = new RandomPassword("kubevoyage-secret", {length: 24}).result.apply(
      password => interpolate`${password}`
  )
  const namespaceKubevoyage = createNamespace("kubevoyage")
  const adminPassword = new RandomPassword("admin-password-kubevoyage", {length: 19, special: true}).result.apply(
      password => interpolate`${password}`
  )
  const postgresUrl = stackRef.getOutput("postgresUrl").apply(url => interpolate`${url}`)

  const password = new RandomPassword("kubevoyageDbPassword", {
    length: 16,
    special: true,
  });

  const role = new Role("kubevoyage", {
    login: true,
    name: "kubevoyage",
    password: password.result
  }, {provider: postgresProvider});
  const database = new Database("kubevoyage", {name: "kubevoyage", owner: role.name}, {provider: postgresProvider});

  const grant = new Grant("kubevoyageFull", {
    database: database.name,
    objectType: "database",
    privileges: ["ALL"],
    role: role.name,
  }, {provider: postgresProvider});


  const voyageConfig: KubevoyageConfig = {
    url: "voyage.burban.me",
    jwtSecret: jwtSecret,
    adminUser: config.get("admin-mail")!!,
    adminPassword: adminPassword,
    dbUrl: postgresUrl,
    dbUser: role.name,
    dbPassword: password.result,
    dbName: database.name
  }

  createKubevoyageHelmChart(namespaceKubevoyage, voyageConfig)
}
