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
};

export default versions;