import * as k8s from "@pulumi/kubernetes";
import {namespaceEtcd} from "../kubernetes/namespace";
import {etcdSecret} from "../kubernetes/Secrets";

export function createEtcd() {
  return new k8s.helm.v3.Chart("etcd", {
    chart: "etcd",
    namespace: namespaceEtcd.metadata.name,
    fetchOpts: {
      repo: "https://charts.bitnami.com/bitnami"
    },
    values: {
      "auth":
          {
            "rbac": {
              create: false,
              "existingSecret": etcdSecret.metadata.name,
              "existingSecretPasswordKey": "root-password"
            },
            client: {
              //secureTransport: true,
              //useAutoTLS: true
              //existingSecret: etcdSecret.metadata.name
            }
          },
      "persistence": {
        "storageClass":"local-path",
        "size": "3Gi"
      },
      nodeSelector: {
        owner: "bjoern"
      }

    }
  })
}
