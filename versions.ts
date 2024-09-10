// versions.ts

export interface VersionEntry {
  repoUrl: string;
  version: string;
  type: "docker" | "helm" | "npm";
  versioning: string;
  depName: string;
  lookupName?: string;
}

export const versions: Record<string, VersionEntry> = {
  nginx: {
    repoUrl: "https://hub.docker.com/_/nginx",
    version: "1.21.6",
    type: "docker",
    versioning: "semver",
    depName: "nginx",
  },
  postgresql: {
    repoUrl: "https://hub.docker.com/_/postgres",
    version: "13.7",
    type: "docker",
    versioning: "semver",
    depName: "postgres",
  },
  redisChart: {
    repoUrl: "https://charts.bitnami.com/bitnami",
    version: "17.3.14",
    type: "helm",
    versioning: "semver",
    depName: "redis",
    lookupName: "bitnami/redis",
  },
  expressJs: {
    repoUrl: "https://www.npmjs.com/package/express",
    version: "4.18.1",
    type: "npm",
    versioning: "npm",
    depName: "express",
  },
  customApp: {
    repoUrl: "https://github.com/myorg/custom-app",
    version: "2023.1.15",
    type: "docker",
    versioning: "regex:^(?<major>\\d{4})\\.(?<minor>\\d+)\\.(?<patch>\\d+)$",
    depName: "myorg/custom-app",
  }
};

export default versions;