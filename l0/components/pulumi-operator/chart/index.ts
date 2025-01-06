import {CustomResourceOptions, Input} from "@pulumi/pulumi";
import {helm} from "@pulumi/kubernetes";
import versions from "../../../versions";
import {Namespace} from "@pulumi/kubernetes/core/v1";

 export function installPulumiOperator(pulumiAccessToken: Input<string>, namespace: Namespace, opts: CustomResourceOptions) {
      //TODO: Switch to Helm Release, to enable Hook Support
      return new helm.v4.Chart("pulumi-operator", {
        chart: versions.pulumiOperator.registryUrl!!,
        namespace: namespace.metadata.name,
        version: versions.pulumiOperator.version,
        values: {
          image: {
            tag: "2.0.0-beta.3"
          }
        }
      }, opts);
    }
