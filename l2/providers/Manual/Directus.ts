import * as k8s from "@pulumi/kubernetes"
import {getEnv} from "@pulumi/kubernetes/utilities";
import {WebService} from "../../types/WebService";
import {Deployment} from "@pulumi/kubernetes/apps/v1";
import {ConfigMap, Namespace, Secret} from "@pulumi/kubernetes/core/v1";
import {keelAnnotationsProd} from "../../../util/globals";
import {createExternalPushSecret, createSecretWrapper, PushSecretData, PushSecretProps} from "../../secrets";
import {getRandomPassword} from "@pulumi/aws/secretsmanager";
import {RandomPassword} from "@pulumi/random";
import {create} from "node:domain";
import {kubernetesProvider} from "../../index";

export function createDirectusManual(namespace: Namespace, secret: Secret, config: ConfigMap) {
  const url = "cms.burban.me"
  const website =  new WebService("directus", url, namespace, "directus/directus", "10.10.7", {}, "prod");

  const deployment = createDirectusDeployments(website, secret, config);
  const service = createDirectusService(website);
  const ingress = createDirectusIngress(website);
}
function createDirectusDeployments(website: WebService, secret: Secret, config: ConfigMap): Deployment {
  const url = "cms.burban.me"

  const token  = new RandomPassword("isrToken", {
    length: 24,
    special: false,
  });
  const secretISR = createSecretWrapper("isr-token-secret", website.namespace, {"ISR_TOKEN":token.result})
  const externalSecretData: PushSecretData[] = [{
    conversionStrategy: "None",
    match: {
      secretKey: "ISR_TOKEN",
      remoteRef: {
        remoteKey: "ISR_TOKEN"
      },
    }
  }]
  const externalSecretProps: PushSecretProps = {secretName: "isr-token-secret", secretData: externalSecretData}
  const externalPushSecret = createExternalPushSecret("isr-token-push-secret", externalSecretProps, kubernetesProvider, website.namespace)


  const directusDataPvc = new k8s.core.v1.PersistentVolumeClaim("directus-data-pvc", {
    metadata: {
      name: "directus-data",
      namespace: website.namespace.metadata.name
    },
    spec: {
      accessModes: ["ReadWriteOnce"],
      resources: {
        requests: {
          storage: "10Gi", // Adjust the size as needed
        },
      },
    },
  });
  return new k8s.apps.v1.Deployment(website.name, {
    metadata: {
      name: website.name,
      namespace: website.namespace.metadata.name,
      labels: {
        name: website.name
      },
    },
    "spec": {
      "strategy": {
        "type": "Recreate"
      },
      "selector": {
        "matchLabels": {
          "name": website.name
        }
      },

      "template": {
        "metadata": {
          "labels": {
            "name": website.name
          }
        },
        "spec": {
          // nodeSelector: {
          // },
          "containers": [
            {
              "name": website.name,
              "image": website.registryImage + ":" + website.imageTag,
              "imagePullPolicy": "Always",
              resources: {
                requests: {
                  memory: "2Gi",
                  cpu: "2000m"
                },
                limits: {
                  memory: "3Gi",
                  cpu: "3000m"
                }
              },
              envFrom: [{
                secretRef: { name: secretISR.metadata.name },
              }],
              "env": [
                {
                  name: "KEY",
                  valueFrom: {configMapKeyRef: {name: config.metadata.name, key: "directus-key"}}
                },
                {
                  name: "SECRET",
                  valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "directus-secret"}}
                },
                {name: "PUBLIC_URL", valueFrom: {configMapKeyRef: {name: config.metadata.name, key: "PUBLIC_URL"}}},
                {
                  name: "ADMIN_EMAIL",
                  valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "admin-mail"}}
                },
                {
                  name: "ASSETS_CONTENT_SECURITY_POLICY_DIRECTIVES__MEDIA_SRC",
                  value: "array:'self',https://" + url
                }, {
                  name: "ASSETS_CONTENT_SECURITY_POLICY_DIRECTIVES__SCRIPT_SRC",
                  value: "array:'self', 'unsafe-inline'"
                },
                {
                  name: "CONTENT_SECURITY_POLICY_DIRECTIVES__SCRIPT_SRC_ATTR",
                  value: "null"
                },
                {
                  name: "CORS_ENABLED",
                  value: "true"
                },
                {
                  name: "CORS_ORIGIN",
                  value: "https://burban.me,https://dev.burban.me,https://dev.tischlerei-bahrenberg.de,https://tischlerei-bahrenberg.de"
                },
                {
                  name: "ADMIN_PASSWORD",
                  valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "admin-password"}}
                },
                {name: "DB_CLIENT", valueFrom: {configMapKeyRef: {name: config.metadata.name, key: "db-client"}}},
                {name: "DB_HOST", valueFrom: {configMapKeyRef: {name: config.metadata.name, key: "db-host"}}}, //
                {name: "DB_PORT", valueFrom: {configMapKeyRef: {name: config.metadata.name, key: "db-port"}}}, // 5432
                {
                  name: "DB_PASSWORD",
                  valueFrom: {secretKeyRef: {name: "directus", key: "db-password"}}
                },
                {name: "DB_USER", valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "db-user"}}},
                {name: "DB_DATABASE", valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "db-name"}}},
                {name: "REDIS_HOST",
                valueFrom: {configMapKeyRef: {name: config.metadata.name, key:"redis-host"}}},
                {name: "REDIS_PORT",
                  valueFrom: {configMapKeyRef: {name: config.metadata.name, key:"redis-port"}}},
                //S3
                {name: "STORAGE_LOCATIONS", value: "amazon,s3,local"},
                {name: "STORAGE_S3_DRIVER", value: "s3"},
                {name: "STORAGE_S3_REGION", value: "EU"},
                {name: "STORAGE_S3_ENDPOINT", value: "https://eu2.contabostorage.com"},
                {
                  name: "STORAGE_S3_KEY",
                  valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "s3-user-key"}}
                },
                {
                  name: "STORAGE_S3_SECRET",
                  valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "s3-user-secret"}}
                },
                {name: "STORAGE_S3_BUCKET", value: "directus" },
                {name: "STORAGE_S3_FORCE_PATH_STYLE", value: "true"},
                {name: "STORAGE_AMAZON_DRIVER", value: "s3"},
                {name: "STORAGE_AMAZON_REGION", valueFrom: {configMapKeyRef: {name: config.metadata.name, key: "aws-s3-region"}}},
                {name: "STORAGE_AMAZON_ENDPOINT", valueFrom: {configMapKeyRef: {name: config.metadata.name, key: "aws-s3-endpoint"}}},
                {
                  name: "STORAGE_AMAZON_KEY",
                  valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "aws-s3-user-key"}}
                },
                {
                  name: "STORAGE_AMAZON_SECRET",
                  valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "aws-s3-user-secret"}}
                },
                {name: "STORAGE_AMAZON_BUCKET", valueFrom: {configMapKeyRef: {name: config.metadata.name, key: "aws-s3-bucket"}}},
                {name: "STORAGE_AMAZON_FORCE_PATH_STYLE", value: "true"},
                {name: "STORAGE_LOCAL_DRIVER", value: "local"},
                {name: "EMAIL_VERIFY_SETUP", value: "true"},
                {name: "EMAIL_FROM", value: "no-reply"+url},
                {name: "EMAIL_TRANSPORT", value: "mailgun"},
                {name: "EMAIL_MAILGUN_DOMAIN", value: "mg.burban.me"},
                {name: "EMAIL_MAILGUN_API_KEY", valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "mg-api-key"}}
                },
                {name:"ASSETS_TRANSFORM_IMAGE_MAX_DIMENSION", value: "8000"},
                {name:"FLOWS_ENV_ALLOW_LIST", value: "ISR_TOKEN"}

              ],
              volumeMounts: [
                {
                  name: "data",
                  mountPath: "/directus/uploads",
                },
                // Mount other volumes if necessary
              ],

              "ports": [
                {
                  "name": "http",
                  "containerPort": 8055
                },],
              "livenessProbe": {
                httpGet: {
                  path: "/",
                  port: "http"
                }
              },
              readinessProbe: {
                httpGet: {
                  path: "/",
                  port: "http"
                }
              }
            }
          ],
          volumes: [
            {
              name: "data",
              persistentVolumeClaim: {
                claimName: directusDataPvc.metadata.name,
              },
            },
            // Define other volumes if necessary
          ],
        }

      }
    }
  })
}
function createDirectusService(webservice: WebService): k8s.core.v1.Service {

  return new k8s.core.v1.Service(webservice.name, {
        "metadata": {
          name: webservice.name,
          namespace: webservice.namespace.metadata.name
        },
        "spec": {
          "ports": [
            {
              "name": "http",
              "port": 80,
              "protocol": "TCP",
              "targetPort": "http"
            }
          ],
          "selector": {
            "name": webservice.name
          }
        }
      });
}

function createDirectusIngress(webservice: WebService): k8s.networking.v1.Ingress {

  return new k8s.networking.v1.Ingress(webservice.name, {
        metadata: {
          annotations: {
            "kubernetes.io/ingress.class": "traefik",
            "cert-manager.io/cluster-issuer": "letsencrypt",
            ...webservice.ingressAnnotations
          },
          namespace: webservice.namespace.metadata.name
        },

        spec: {
          tls: [{
            secretName: webservice.name + "-tls",
            hosts: [webservice.url]
          }],
          rules: [
            {
              host: webservice.url,
              http: {
                paths: [{
                  pathType: "Prefix",
                  path: "/",
                  backend: {service: {name: webservice.name, port:{number: 80 }}}
                }]
              }
            }]

        }
      }
  );
}