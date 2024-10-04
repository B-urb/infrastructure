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
    version: "v2.0.3",
    depName: "surrealdb/surrealdb",
    datasource: "docker",
    versioning: "semver-coerced",
  },
  redis: {
    version: "18.19.4",
    depName: "redis",
    datasource: "helm",
    versioning: "helm",
    registryUrl: "https://charts.bitnami.com/bitnami"
  },
  postgresql: {
    version: "14.3.3",
    depName: "postgresql",
    datasource: "helm",
    versioning: "helm",
    registryUrl: "https://charts.bitnami.com/bitnami"
  },
};

export default versions;