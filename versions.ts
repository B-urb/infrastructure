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
    version: "10.10.7",
    depName: "directus/directus",
    datasource: "docker",
    versioning: "semver",
    registryUrl: "https://hub.docker.com"
  },
  nginx: {
    version: "1.21.6",
    depName: "nginx",
    datasource: "docker",
    versioning: "semver",
    registryUrl: "https://hub.docker.com"
  },
  postgresql: {
    version: "13.7",
    depName: "postgres",
    datasource: "docker",
    versioning: "semver",
    registryUrl: "https://hub.docker.com"
  },
  redisChart: {
    version: "17.3.14",
    depName: "bitnami/redis",
    datasource: "helm",
    versioning: "semver",
    registryUrl: "https://charts.bitnami.com/bitnami"
  },
  expressJs: {
    version: "4.18.1",
    depName: "express",
    datasource: "npm",
    versioning: "npm",
    registryUrl: "https://registry.npmjs.org"
  },
  customApp: {
    version: "2023.1.15",
    depName: "myorg/custom-app",
    datasource: "github-releases",
    versioning: "regex:^(?<major>\\d{4})\\.(?<minor>\\d+)\\.(?<patch>\\d+)$"
  }
};

export default versions;