import * as pulumi from "@pulumi/pulumi";
import {createNamespace} from "./namespace";
import {createGitlabRunner} from "./GitlabRunner";
import * as gitlab from "@pulumi/gitlab";
import * as github from "@pulumi/github";
import {createCluster} from "./infra/nodes";
import {Domain} from "@pulumi/mailgun";
import {HCloudOrchestrator} from "./cloud_providers/hetzner/HCloudOrchestrator";
import {K3sCluster} from "./k3s/K3sCluster";


const config = new pulumi.Config();
const hcloudToken = config.requireSecret("hcloudToken");
const datacenterId = "fsn1-dc14"
const location = "fsn1"
const hetznerOrchestrator = new HCloudOrchestrator(hcloudToken, datacenterId, location);
const k3sCluster = new K3sCluster(hetznerOrchestrator);
// if gitlab

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
