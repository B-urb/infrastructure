import {apiextensions, helm, Provider} from "@pulumi/kubernetes";
import {Secret} from "@pulumi/kubernetes/core/v1/secret";
import {CustomResourceOptions, Input, Lifted, OutputInstance} from "@pulumi/pulumi";
import {Namespace} from "@pulumi/kubernetes/core/v1";

export function installCilium(opts: CustomResourceOptions) {
  return new helm.v3.Chart("cilium", {
    chart: "cilium",
    version: "1.15.6",
    namespace: "kube-system",
    fetchOpts: {
      repo: "https://helm.cilium.io/",
    },
  }, opts)
}



export function installCertManager(opts: CustomResourceOptions) {
  //TODO: Switch to Helm Release, to enable Hook Support
  return new helm.v3.Chart("cert-manager", {
    chart: "cert-manager",
    version: "v1.15.0",
    fetchOpts: {
      repo: "https://charts.jetstack.io",
    },
    namespace: "kube-system",
    values: {
      installCRDs: true,
    },
  }, opts);
}

export function installExternalSecretsOperator(opts: CustomResourceOptions) {
  //TODO: Switch to Helm Release, to enable Hook Support
  const version = "v0.9.16"
  const ns = new Namespace("external-secrets",{
    metadata: {
      name: "external-secrets"
    }
  }, opts)
  return new helm.v3.Chart("external-secrets", {
    chart: "external-secrets",
    version: version,
    fetchOpts: {
      repo: "https://charts.external-secrets.io",
    },
    namespace: ns.metadata.name,
    values: {
      installCRDs: true,
    },
  }, opts);
  //TODO: create secret
}
export function installIstio(opts: CustomResourceOptions) {
  //TODO: Switch to Helm Release, to enable Hook Support
  const version = "1.21.2"
  const ns = new Namespace("istio-system",{
    metadata: {
      name: "istio-system"
    }
  }, opts)
  new helm.v3.Chart("istio-base", {
    chart: "base",
    version: version,
    fetchOpts: {
      repo: "https://istio-release.storage.googleapis.com/charts",
    },
    namespace: ns.metadata.name,
    values: {
      installCRDs: true,
    },
  }, opts);

  return new helm.v3.Chart("istiod", {
    chart: "istiod",
    version: version,
    fetchOpts: {
      repo: "https://istio-release.storage.googleapis.com/charts",
    },
    namespace: ns.metadata.name,
    values: {
      "istio_cni": {
        enabled: true
      },
    },
  }, opts);
}

export function installClusterIssuer(mail: Input<string>, opts: CustomResourceOptions) {
  return new apiextensions.CustomResource("letsencrypt-issuer", {
    apiVersion: "cert-manager.io/v1",
    kind: "ClusterIssuer",
    metadata: {
      name: "letsencrypt",
    },
    spec: {
      acme: {
        server: "https://acme-v02.api.letsencrypt.org/directory",
        email: mail,
        privateKeySecretRef: {
          name: "letsencrypt",
        },
        solvers: [{
          http01: {
            ingress: {
              class: "traefik",
            },
          },
        }],
      },
    },
  }, opts);
}

export function installCSIDriver(token: Input<string>, opts: CustomResourceOptions) {
  new Secret("hcloud-token",{
    metadata: {
      name: "hcloud",
      namespace: "kube-system"
    },
    stringData: {
      "token": token
    }
  },opts)

  return new helm.v3.Chart("hcloud-csi", {
    chart: "hcloud-csi",
    namespace: "kube-system",
    fetchOpts: {
      repo: "https://charts.hetzner.cloud/"
    },
  },opts)
}