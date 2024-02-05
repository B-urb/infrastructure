import {CustomResourceOptions} from "@pulumi/pulumi";
import {helm} from "@pulumi/kubernetes";

 export function installFlux(opts: CustomResourceOptions) {
      //TODO: Switch to Helm Release, to enable Hook Support
      return new helm.v3.Chart("flux-operator", {
        chart: "pulumi-kubernetes-operator",
        version: "v0.5.0",
        fetchOpts: {
          repo: "https://pulumi.github.io/pulumi-kubernetes-operator",
        },

      }, opts);
    }
