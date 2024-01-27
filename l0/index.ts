import * as pulumi from "@pulumi/pulumi";
import {createNamespace} from "./namespace";
import {createGitlabRunner} from "./components/GitlabRunner";
import * as gitlab from "@pulumi/gitlab";
import * as github from "@pulumi/github";
import {Domain} from "@pulumi/mailgun";
import * as hcloud from "@pulumi/hcloud"
import {HCloudOrchestrator} from "./cloud_providers/hetzner/HCloudOrchestrator";
import {K3sCluster} from "./k3s/K3sCluster";
import * as fs from "fs";
import {Provider} from "@pulumi/kubernetes";
import {installCertManager, installCilium, installClusterIssuer, installCSIDriver} from "./components/addons";
import {RandomPassword} from "@pulumi/random";


const config = new pulumi.Config();
const clusterName = "urban"
const filename = `${clusterName}.yaml`;
const mail = config.get("emailAdress")
const hcloudToken = config.requireSecret("hcloudToken");
const datacenterId = "fsn1-dc14"
const location = "fsn1"
const provider = new hcloud.Provider("hcloud-provider", { token: hcloudToken})
const hetznerOrchestrator = new HCloudOrchestrator(provider, datacenterId, location);
const k3sToken = new RandomPassword("k3sToken", {
  special: false,
  length: 30
})
const k3sCluster = new K3sCluster(hetznerOrchestrator, provider, hcloudToken, k3sToken);
const result = k3sCluster.createCluster(clusterName, true)
// Write to a file
result.kubeconfig.apply(value => {
  fs.writeFileSync(filename, value, 'utf8');
  console.log(`File written: ${filename}`);
});

const kubernetesProvider = new Provider("kube-provider", {kubeconfig: result.kubeconfig, cluster: clusterName, context: clusterName })
const cilium = installCilium({provider:kubernetesProvider});
installCSIDriver(hcloudToken,{provider: kubernetesProvider, dependsOn: [cilium]})
const certManager = installCertManager({provider:kubernetesProvider})
installClusterIssuer(mail,{provider: kubernetesProvider, dependsOn: [certManager]})


// const example = new gitlab.GroupVariable("kubeconfig", {
//   environmentScope: "*",
//   group: "12345",
//   key: "kubeconfig",
//   masked: false,
//   "protected": false,
//   value: token,
//   variableType: "file"
// });
// Create Gitlab Runner

//else github
/*
const exampleSecretActionsEnvironmentSecret = new github.ActionsEnvironmentSecret("exampleSecretActionsEnvironmentSecret", {
  environment: "example_environment",
  secretName: "example_secret_name",
  plaintextValue: _var.some_secret_string,
});
const exampleSecretIndex_actionsEnvironmentSecretActionsEnvironmentSecret = new github.ActionsEnvironmentSecret("exampleSecretIndex/actionsEnvironmentSecretActionsEnvironmentSecret", {
  environment: "example_environment",
  secretName: "example_secret_name",
  encryptedValue: _var.some_encrypted_secret_string,
});
*/

//TODO: use pulumi for mailgun
// const _default = new Domain("default", {
//   dkimKeySize: 1024,
//   region: "eu",
//   smtpPassword: "supersecretpassword1234",
//   spamAction: "disabled",
// });

//export const namespaceGitlab = createNamespace("gitlab")

//const gitlabRunner = createGitlabRunner(namespaceGitlab)
