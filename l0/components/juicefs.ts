/**
 * @Author: Felix Breuer(https://github.com/breuerfelix)
 */
import * as k8s from "@pulumi/kubernetes"
import * as pulumi from "@pulumi/pulumi"
import { getIngress } from "../utils"

const ident = "juicefs"
const ns = new k8s.core.v1.Namespace(ident, {
  metadata: { name: ident },
})

const redis = new k8s.helm.v3.Release("redis", {
  namespace: ns.metadata.name,
  name: "redis",
  chart: "redis",
  version: "16.12.2",
  repositoryOpts: {
    repo: "https://charts.bitnami.com/bitnami",
  },
  values: {
    architecture: "standalone",
    auth: { enabled: false },
    master: {
      persistence: {
        enabled: true,
        storageClass: "openstack",
        size: "5Gi",
      },
      nodeSelector: { owner: "felix" },
    },
  },
})

const redisService = k8s.core.v1.Service.get(
    "redis-headless",
    pulumi.interpolate`${redis.status.namespace}/${redis.status.name}-headless`,
);

const minioSecret = {
  name: "juice",
  metaurl: pulumi.interpolate`redis://${redisService.metadata.name}`,
  storage: "s3",
  accessKey: "inovex",
  secretKey: "ino-cluster",
  bucket: "https://minio.tecios.de/juicefs",
}

const juiceStorageClassName = "juice"
const juicefs = new k8s.helm.v3.Release("juicefs-driver", {
  namespace: ns.metadata.name,
  chart: "juicefs-csi-driver",
  version: "0.13.1",
  repositoryOpts: {
    repo: "https://juicedata.github.io/charts",
  },
  values: {
    storageClasses: [
      {
        enabled: true,
        name: juiceStorageClassName,
        annotations: {
          "storageclass.kubernetes.io/is-default-class": "true",
        },
        reclaimPolicy: "Delete",
        backend: {
          ...minioSecret,
          trashDays: "0",
        },
      },
    ],
  },
})

const storage = k8s.storage.v1.StorageClass.get(
    "juice-delete",
    pulumi.interpolate`${juicefs.status.namespace}/${juiceStorageClassName}`,
)

export const juicefsStorage = storage.metadata.name

new k8s.helm.v3.Release("juicefs-gateway", {
  namespace: ns.metadata.name,
  chart: "juicefs-s3-gateway",
  version: "0.9.0",
  repositoryOpts: {
    repo: "https://juicedata.github.io/charts",
  },
  values: {
    secret: minioSecret,
    ingress: {
      enabled: true,
      className: "",
      ...getIngress("juicefs.tecios.de"),
    },
  },
})

new k8s.helm.v3.Release("juicefs-volume-hook", {
  namespace: ns.metadata.name,
  chart: "juicefs-volume-hook",
  version: "0.2.4",
  repositoryOpts: {
    repo: "https://breuerfelix.github.io/juicefs-volume-hook",
  },
  values: {
    controller: {
      tag: "0.2.2",
      // TODO: test this out
      //storageClasses: juiceStorageClassName,
    },
  },
})