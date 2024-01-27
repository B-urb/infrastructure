import {apiextensions, helm, Provider} from "@pulumi/kubernetes";
import {Secret} from "@pulumi/kubernetes/core/v1/secret";
import {CustomResourceOptions, Input, Lifted, OutputInstance} from "@pulumi/pulumi";

export function installCilium(opts: CustomResourceOptions) {
  return new helm.v3.Chart("cilium", {
    chart: "cilium",
    version: "1.14.6",
    namespace: "kube-system",
    fetchOpts: {
      repo: "https://helm.cilium.io/",
    },
  }, opts)
}



export function installCertManager(opts: CustomResourceOptions) {
  return new helm.v3.Chart("cert-manager", {
    chart: "cert-manager",
    version: "v1.13.3",
    fetchOpts: {
      repo: "https://charts.jetstack.io",
    },
    namespace: "kube-system",
    values: {
      installCRDs: true,
    },
  }, opts);
}

export function installClusterIssuer(mail: Input<string>, opts: CustomResourceOptions) {
  return new apiextensions.CustomResource("letsencrypt-issuer", {
    apiVersion: "cert-manager.io/v1",
    kind: "ClusterIssuer",
    metadata: {
      name: "letsencrypt-prod",
    },
    spec: {
      acme: {
        server: "https://acme-v02.api.letsencrypt.org/directory",
        email: mail,
        privateKeySecretRef: {
          name: "letsencrypt-prod",
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