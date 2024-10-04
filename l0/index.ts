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
import {
  installCertManager,
  installCilium,
  installClusterIssuer,
  installCSIDriver,
  installExternalSecretsOperator, installIstio
} from "./components/addons";
import {RandomPassword} from "@pulumi/random";
import {installFlux} from "./components/flux/chart";
import {Namespace} from "@pulumi/kubernetes/core/v1";
import {createHetznerK3S} from "./create/Hetzner";
import {getStack} from "@pulumi/pulumi";
import {create} from "node:domain";
import {createOpenstackK3S} from "./create/Openstack";


const stack = getStack()

const config = new pulumi.Config();
const clusterName = "urban"
const mail = config.get("emailAdress")!!
const kubeconfig = "";
if (stack == "hetzner") {
  const kubeconfig = createHetznerK3S(config, clusterName, mail)
} else if (stack == "openstack") {
  createOpenstackK3S(config, clusterName, mail)
} else {
  throw Error("invalid stack")
}
