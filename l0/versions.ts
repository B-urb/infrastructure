// versions.ts

export interface VersionEntry {
  version: string;
  depName: string;
  datasource: string;
  versioning: string;
  registryUrl?: string;
}

export const versions: Record<string, VersionEntry> = {
  juiceCsiDriver: {
    version: "0.21.3",
    depName: "juicefs-csi-driver",
    datasource: "helm",
    versioning: "helm",
    registryUrl: "https://juicedata.github.io/charts"
  },
  cilium: {
    version: "1.16.4",
    depName: "cilium",
    datasource: "helm",
    versioning: "helm",
    registryUrl: "https://helm.cilium.io/"
  },
  certManager: {
    version: "v1.16.2",
    depName: "cert-manager",
    datasource: "helm",
    versioning: "semver-coerced",
    registryUrl: "https://charts.jetstack.io"
  },
  istioBase: {
    version: "1.24.0",
    depName: "base",
    datasource: "helm",
    versioning: "helm",
    registryUrl: "https://istio-release.storage.googleapis.com/charts"
  },
  istioD: {
    version: "1.24.0",
    depName: "istiod",
    datasource: "helm",
    versioning: "helm",
    registryUrl: "https://istio-release.storage.googleapis.com/charts"
  },
  hcloudCSI: {
    version: "2.10.1",
    depName: "hcloud-csi",
    datasource: "helm",
    versioning: "helm",
    registryUrl: "https://charts.hetzner.cloud/"
  },
  externalSecrets: {
    version: "0.10.6",
    depName: "external-secrets",
    datasource: "helm",
    versioning: "semver-coerced",
    registryUrl: "https://charts.external-secrets.io"
  },

};

export default versions;