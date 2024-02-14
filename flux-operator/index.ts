import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
import {Secret} from "@pulumi/kubernetes/core/v1";
import {CustomResource} from "@pulumi/kubernetes/apiextensions";

const defaultCRDVersion = "v1.14.0";
const defaultOperatorVersion = "v1.14.0";
const image = "bjoern5urban/pulumi-kubernetes-operator:latest"
const config = new pulumi.Config();
const deployNamespace = config.get("namespace") || 'default';
const deployNamespaceList = config.getObject<string[]>("namespaces") || [deployNamespace];
const crdVersion = config.get("crd-version") || defaultCRDVersion;
const operatorVersion = config.get("operator-version") || defaultOperatorVersion;
// Get the Pulumi API token.
const pulumiAccessToken = config.requireSecret("pulumiAccessToken")

const stackCRD = new kubernetes.yaml.ConfigFile("stackcrd", {
  file: `https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/${crdVersion}/deploy/crds/pulumi.com_stacks.yaml`
});
const programCRD = new kubernetes.yaml.ConfigFile("programcrd", {
  file: `https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/${crdVersion}/deploy/crds/pulumi.com_programs.yaml`
});

const deploymentOptions = {dependsOn: [stackCRD, programCRD]};
const operatorClusterRole = new kubernetes.rbac.v1.ClusterRole(`operator-cluster-role`, {
  rules: [
    {
      apiGroups: ["*"],
      resources: ["*"],
      verbs: ["*"],
    },
    // Add other rules as needed
  ],
});
const ns = deployNamespaceList[0]
  const operatorServiceAccount = new kubernetes.core.v1.ServiceAccount(`operator-service-account-${ns}`, {
    metadata: {
      "namespace": ns,
    },
  });



// Bind the ClusterRole to the service account
  const operatorClusterRoleBinding = new kubernetes.rbac.v1.ClusterRoleBinding(`operator-cluster-role-binding`, {
    metadata: {
      name: `operator-cluster-role-binding`,
    },
    subjects: [{
      kind: "ServiceAccount",
      name: operatorServiceAccount.metadata.name,
      namespace: ns, // Specify the namespace of the ServiceAccount
    }],
    roleRef: {
      kind: "ClusterRole",
      name: operatorClusterRole.metadata.name,
      apiGroup: "rbac.authorization.k8s.io",
    },
  });
  const operatorDeployment = new kubernetes.apps.v1.Deployment(`pulumi-kubernetes-operator-${ns}`, {
    metadata: {
      "namespace": ns,
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          name: "pulumi-kubernetes-operator",
        },
      },
      template: {
        metadata: {
          labels: {
            name: "pulumi-kubernetes-operator",
          },
        },
        spec: {
          serviceAccountName: operatorServiceAccount.metadata.name,
          containers: [{
            name: "pulumi-kubernetes-operator",
            image: image,
            args: ["--zap-level=error", "--zap-time-encoding=iso8601"],
            imagePullPolicy: "Always",
            env: [
              {
                name: "WATCH_NAMESPACE",
                valueFrom: {
                  fieldRef: {
                    fieldPath: "metadata.namespace",
                  },
                },
              },
              {
                name: "POD_NAME",
                valueFrom: {
                  fieldRef: {
                    fieldPath: "metadata.name",
                  },
                },
              },
              {
                name: "OPERATOR_NAME",
                value: "pulumi-kubernetes-operator",
              },
              {
                name: "GRACEFUL_SHUTDOWN_TIMEOUT_DURATION",
                value: "5m",
              },
              {
                name: "MAX_CONCURRENT_RECONCILES",
                value: "10",
              },


            ],
          }],
          // Should be same or larger than GRACEFUL_SHUTDOWN_TIMEOUT_DURATION
          terminationGracePeriodSeconds: 300,
        },
      },
    },
  }, deploymentOptions);

// Create the API token as a Kubernetes Secret.
  const accessToken = new Secret("operator-accesstoken", {
    metadata: {
      name: "flux-secret",
      namespace: ns
    },
    stringData: {accessToken: pulumiAccessToken},
  });
// Create an NGINX deployment in-cluster.
  const stackL1 = new CustomResource("l1", {
    apiVersion: 'pulumi.com/v1',
    kind: 'Stack',
    metadata: {
      name: "l1",
      namespace: ns
    },
      spec: {
        envRefs: {
          PULUMI_ACCESS_TOKEN: {
            type: "Secret",
            secret: {
              key: "accessToken",
              name: accessToken.metadata.name,
              namespace: ns,
            },
          }
        },
        stack: "hetzner",
        projectRepo: "https://github.com/tecios/infrastructure",
        repoDir: "/l1",
        branch: "development",
        retryOnUpdateConflict: true,
        destroyOnFinalize: true,
      }
    });
  const stackL2 = new CustomResource("l2", {
    apiVersion: 'pulumi.com/v1',
    kind: 'Stack',
    metadata: {
      name: "l2",
      namespace: ns
    },
    spec: {
      envRefs: {
        PULUMI_ACCESS_TOKEN: {
          type: "Secret",
          secret: {
            key: "accessToken",
            name: accessToken.metadata.name,
            namespace: ns,
          },
        }
      },
      stack: "hetzner",
      projectRepo: "https://github.com/tecios/infrastructure",
      repoDir: "/l2",
      branch: "development",
      prerequisites: [
        {name: "l1"}
      ],
      retryOnUpdateConflict: true,
      destroyOnFinalize: true,
    }
  });
