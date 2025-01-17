import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
import {Secret} from "@pulumi/kubernetes/core/v1";
import {CustomResource} from "@pulumi/kubernetes/apiextensions";
import {createStackL1Prod} from "./stacks/prod/l1";
import {createStackL2Prod} from "./stacks/prod/l2";
import {createStackL1Dev} from "./stacks/dev/l1";
import {createStackL2Dev} from "./stacks/dev/l2";
import {throws} from "node:assert";


const stack = pulumi.getStack()
const defaultCRDVersion = "v1.16.0";
const defaultOperatorVersion = "v1.16.0";
const image = stack === "hetzner" ? "pulumi/pulumi-kubernetes-operator:v2.0.0-beta.3" : "pulumi/pulumi-kubernetes-operator:v1.16.0"
const config = new pulumi.Config();
const deployNamespace = config.get("namespace") || 'default';
const deployNamespaceList = config.getObject<string[]>("namespaces") || [deployNamespace];
const crdVersion = config.get("crd-version") || defaultCRDVersion;
const operatorVersion = config.get("operator-version") || defaultOperatorVersion;
// Get the Pulumi API token.
const pulumiAccessToken = config.requireSecret("pulumiAccessToken")
const tagL1 = process.env.versionTag
const tagL2 = process.env.versionTag
if (stack == "hetzner" && (tagL1 == undefined || tagL2 == undefined))
  throw Error("tag not set")
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


// Create the API token as a Kubernetes Secret.
const accessToken = new Secret("operator-accesstoken", {
  metadata: {
    name: "pulumi-operator-secret",
    namespace: ns
  },
  stringData: {accessToken: pulumiAccessToken},
});
// Create an NGINX deployment in-cluster.

if (stack == "hetzner") {
  createStackL1Prod(ns, accessToken,tagL1)
  createStackL2Prod(ns, accessToken, tagL2)
} else if (stack == "openstack") {
  createStackL1Dev(ns, accessToken)
  createStackL2Dev(ns, accessToken)
} else {
  throw Error(`Wrong stack, no definition for stack ${stack}`)
}

