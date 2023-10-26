import * as k8s from "@pulumi/kubernetes";

function createDirectusS3Service() {
  return new k8s.core.v1.Service("directus-s3", {
    "metadata": {
      name: "directus-s3"
    }, spec: {
      type: "ExternalName",
      externalName: "minio.minio.svc.cluster.local",
      ports: [{
        port: 9000,
        protocol: "TCP",
        targetPort: 80,
        name: "minio"
      }]
    }
  })
}