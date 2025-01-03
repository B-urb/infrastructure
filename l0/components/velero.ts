/**
 * @Author: Felix Breuer(https://github.com/breuerfelix)
 */
import * as k8s from "@pulumi/kubernetes"

const ident = "velero"
const ns = new k8s.core.v1.Namespace(ident, {
  metadata: { name: ident },
})

new k8s.helm.v4.Release("velero", {
  namespace: ns.metadata.name,
  name: "velero",
  chart: "velero",
  version: "3.1.2",
  repositoryOpts: {
    repo: "https://vmware-tanzu.github.io/helm-charts",
  },
  values: {
    metrics: { enabled: false },
    snapshotsEnabled: false,
    initContainers: [{
      name: "velero-plugin-for-aws",
      image: "velero/velero-plugin-for-aws:v1.3.0",
      imagePullPolicy: "IfNotPresent",
      volumeMounts: [{
        mountPath: "/target",
        name: "plugins",
      }],
    }],
    configuration: {
      provider: "aws",
      backupStorageLocation: {
        bucket: "velero",
        config: {
          region: "minio",
          s3ForcePathStyle: true,
          s3Url: "https://minio.tecios.de",
        },
      },
    },
    credentials: {
      useSecret: true,
      name: "minio-creds",
      secretContents: {
        cloud: `
[default]
aws_access_key_id = inovex
aws_secret_access_key = ino - cluster
`,
      },
    },
  },
})