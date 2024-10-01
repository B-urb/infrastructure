// versions.ts

export interface VersionEntry {
  version: string;
  depName: string;
  datasource: string;
  versioning: string;
  registryUrl?: string;
}

export const versions: Record<string, VersionEntry> = {
  surrealDB: {
    version: "v1.2.0",
    depName: "surrealdb/surrealdb",
    datasource: "docker",
    versioning: "semver-coerced",
  },
  redis: {
    version: "18.13.0",
    depName: "redis",
    datasource: "helm",
    versioning: "helm",
    registryUrl: "https://charts.bitnami.com/bitnami"
  },
  postgresql: {
    version: "15.5.38",
    depName: "postgresql",
    datasource: "helm",
    versioning: "helm",
    registryUrl: "https://charts.bitnami.com/bitnami"
  },
  surrealDB: {
    version: "v1.2.0",
    depName: "surrealdb/surrealdb",
    datasource: "docker",
    versioning: "semver-coerced",
  },
  18.13.0
};

export default versions;