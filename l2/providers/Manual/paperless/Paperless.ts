import * as k8s from "@pulumi/kubernetes";
// Paperless Deployment updated with PVCs
import * as pulumi from "@pulumi/pulumi";
import {ConfigMap, Namespace, Secret} from "@pulumi/kubernetes/core/v1";

export function createPaperless(namespace: Namespace, secret: Secret, config: ConfigMap) {
  const url = "docs.burban.me"
// Define PVCs for Paperless
const paperlessDataPvc = new k8s.core.v1.PersistentVolumeClaim("paperless-data-pvc", {
  metadata: {
    name: "paperless-data",
    namespace: namespace.metadata.name
  },
  spec: {
    accessModes: ["ReadWriteOnce"],
    resources: {
      requests: {
        storage: "10Gi", // Adjust the size as needed
      },
    },
    storageClassName: "local-path", // Using the default storage class
  },
});

const paperlessMediaPvc = new k8s.core.v1.PersistentVolumeClaim("paperless-media-pvc", {
  metadata: {
    name: "paperless-media",
    namespace: namespace.metadata.name
  },
  spec: {
    accessModes: ["ReadWriteOnce"],
    resources: {
      requests: {
        storage: "10Gi", // Adjust the size as needed
      },
    },
    storageClassName: "local-path", // Using the default storage class
  },
});



// Paperless Deployment
const paperlessDeployment = new k8s.apps.v1.Deployment("paperless-deployment", {
  metadata: {
    name: "paperless",
    namespace: namespace.metadata.name,
    labels: {
      name: "paperless"
    }
  },
  spec: {
    selector: { matchLabels: { app: "paperless" } },
    replicas: 1,
    template: {
      metadata: { labels: { app: "paperless" } },
      spec: {
        containers: [{
          name: "paperless",
          image: "ghcr.io/paperless-ngx/paperless-ngx:latest",
          ports: [{ containerPort: 8000 }],
          env: [
            { name: "PAPERLESS_REDIS", value: "redis://redis-redis-master.redis:6379" },
            { name: "PAPERLESS_DBHOST", valueFrom:{configMapKeyRef:{name: config.metadata.name, key: "postgresHost"}}},
            { name: "PAPERLESS_DBUSER", valueFrom:{secretKeyRef:{name: secret.metadata.name, key: "postgresUser"}}},
            { name: "PAPERLESS_DBPASS", valueFrom:{secretKeyRef:{name: secret.metadata.name, key: "postgresPassword"}}},
            { name: "PAPERLESS_DBNAME", valueFrom:{configMapKeyRef:{name: config.metadata.name, key: "postgresDBName"}}},
            { name: "PAPERLESS_TIKA_ENABLED", value: "1" },
            { name: "PAPERLESS_TIKA_GOTENBERG_ENDPOINT", value: "http://gotenberg" },
            { name: "PAPERLESS_TIKA_ENDPOINT", value: "http://tika" },
          ],
          volumeMounts: [
            {
              name: "data",
              mountPath: "/usr/src/paperless/data",
            },
            {
              name: "media",
              mountPath: "/usr/src/paperless/media",
            },
            // Mount other volumes if necessary
          ],
        }],
        volumes: [
          {
            name: "data",
            persistentVolumeClaim: {
              claimName: paperlessDataPvc.metadata.name,
            },
          },
          {
            name: "media",
            persistentVolumeClaim: {
              claimName: paperlessMediaPvc.metadata.name,
            },
          },
          // Define other volumes if necessary
        ],
      },
    },
  },
});


// Tika Deployment
const tikaDeployment = new k8s.apps.v1.Deployment("tika-deployment", {
  metadata: {
    name: "tika",
    namespace: namespace.metadata.name
  },
  spec: {
    selector: { matchLabels: { app: "tika" } },
    replicas: 1,
    template: {
      metadata: { labels: { app: "tika" } },
      spec: {
        containers: [{
          name: "tika",
          image: "ghcr.io/paperless-ngx/tika:latest",
        }],
      },
    },
  },
});

// Tika Service
const tikaService = new k8s.core.v1.Service("tika-service", {
  metadata: {
    name: "tika",
    namespace: namespace.metadata.name
  },
  spec: {
    selector: { app: "tika" },
    ports: [{ port: 80, targetPort: 9998 }],
    type: "ClusterIP",
  },
});

// Gotenberg Deployment
const gotenbergDeployment = new k8s.apps.v1.Deployment("gotenberg-deployment", {
  metadata: {
    name: "gotenberg",
    namespace: namespace.metadata.name
  },
  spec: {
    selector: { matchLabels: { app: "gotenberg" } },
    replicas: 1,
    template: {
      metadata: { labels: { app: "gotenberg" } },
      spec: {
        containers: [{
          name: "gotenberg",
          image: "docker.io/gotenberg/gotenberg:7.8",
          command: [
            "gotenberg",
            "--chromium-disable-javascript=true",
            "--chromium-allow-list=file:///tmp/.*",
          ],
        }],
      },
    },
  },
});

// Gotenberg Service
const gotenbergService = new k8s.core.v1.Service("gotenberg-service", {
  metadata: {
    name: "gotenberg",
    namespace: namespace.metadata.name
  },
  spec: {
    selector: { app: "gotenberg" },
    ports: [{ port: 80, targetPort: 3000 }],
    type: "ClusterIP",
  },
});
// Paperless Service
const paperlessService = new k8s.core.v1.Service("paperless-service", {
  metadata: {
    name: "paperless",
    namespace: namespace.metadata.name
  },
  spec: {
    selector: { app: "paperless" },
    ports: [{ port: 80, targetPort: 8000 }],
    type: "ClusterIP",
  },
});

// Paperless Ingress
const ingress = new k8s.networking.v1.Ingress("paperless-ingress", {
      metadata: {
        name: "paperless",
        annotations: {
          "kubernetes.io/ingress.class": "traefik",
          "cert-manager.io/cluster-issuer": "letsencrypt",
        },
        namespace: namespace.metadata.name
      },

      spec: {
        tls: [{
          secretName: "paperless-tls",
          hosts: [url]
        }],
        rules: [
          {
            host: url,
            http: {
              paths: [{
                pathType: "Prefix",
                path: "/",
                backend: {service: {name: paperlessService.metadata.name, port:{number: 80 }}}
              }]
            }
          }]

      }
    }
);
}