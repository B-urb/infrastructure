// versions.ts

export interface VersionEntry {
  version: string;
  depName: string;
  datasource: string;
  versioning: string;
  registryUrl?: string;
}

export const versions: Record<string, VersionEntry> = {
  directus: {
    version: "10.13.3",
    depName: "directus/directus",
    datasource: "docker",
    versioning: "docker",
  },
  vaultwarden: {
    version: "1.32.1-alpine",
    depName: "vaultwarden/server",
    datasource: "docker",
    versioning: "docker",
  },
};

export default versions;