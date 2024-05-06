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
const result = k3sCluster.createCluster(clusterName, true, 1, 1)
// Write to a file
result.kubeconfig.apply(value => {
  fs.writeFileSync(filename, value, 'utf8');
  console.log(`File written: ${filename}`);
});

const kubernetesProviderConfig = {kubeconfig: result.kubeconfig, cluster: clusterName, context: clusterName }
// Export config for other stacks and levels
export const kubeconfig = pulumi.secret(result.kubeconfig)
export const cluster = clusterName


const kubernetesProvider = new Provider("kube-provider", kubernetesProviderConfig)

// install kubernetes extensions
const cilium = installCilium({provider:kubernetesProvider});
installCSIDriver(hcloudToken,{provider: kubernetesProvider, dependsOn: [cilium]})
const certManager = installCertManager({provider:kubernetesProvider})
installClusterIssuer(mail!!,{provider: kubernetesProvider, dependsOn: [certManager]})
installIstio({provider: kubernetesProvider})
const externalSecrets = installExternalSecretsOperator({provider: kubernetesProvider})
new Namespace("flux-system", {
  metadata: {
    name: "flux-system"
  },
},
{provider: kubernetesProvider}
)