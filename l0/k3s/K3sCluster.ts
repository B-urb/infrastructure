import * as fs from "fs";
import * as cloudinit from "@pulumi/cloudinit"
import * as command from "@pulumi/command"
import * as pulumi from "@pulumi/pulumi";
import * as hcloud from "@pulumi/hcloud";
import {Input} from "@pulumi/pulumi";
import {createCluster} from "../infra/nodes";
import {ICloudOrchestrator} from "../common/interfaces/ICloudOrchestrator";
import {CloudProviderTypes} from "../common/types/cloudProviderTypes";


export class K3sCluster<T extends keyof CloudProviderTypes> {
  private orchestrator: ICloudOrchestrator;

  constructor(orchestrator: ICloudOrchestrator) {
    this.orchestrator = orchestrator;
    this.createCluster()
  }

   createCluster() {

    const publicKey = fs.readFileSync('/Users/bjornurban/.ssh/id_rsa.pub', 'utf8');
    const publicKeys = Array.from(publicKey)

     const userData = this.getCloudInit()
// Create the SSH key resource on Hetzner Cloud
    const network = this.orchestrator.createNetwork("main-network")
    const subnet = this.orchestrator.createSubnet(network, "main-subnet")
    const serverType = "cax21"
    const initialNode = this.orchestrator.createServer(publicKeys, network, serverType, userData,"node-01")

  }
   getCloudInit() {
    return cloudinit.getConfig({
      gzip: false,
      base64Encode: false,

      parts: [
        {
          contentType: "text/x-shellscript",
          content: fs.readFileSync("./ensure-curl.sh", "utf8"),
        },
        {
          contentType: "text/x-shellscript",
          content: fs.readFileSync("./install-k3s.sh", "utf8"),
        },
      ],
    });
  }
   createMasterNode(name: string, config: hcloud.ServerArgs, token: pulumi.Output<string>): pulumi.Output<hcloud.Server> {
    const modifiedConfig = {
      ...config,
      userData: token.apply(t => `#cloud-config\nyour-configuration-here\nK3S_TOKEN=${t}`),
    };

    const workerServer = new hcloud.Server(name, modifiedConfig);
    return pulumi.output(workerServer);
  }
   createWorkerNode(name: string, config: hcloud.ServerArgs, token: pulumi.Output<string>): pulumi.Output<hcloud.Server> {
    const modifiedConfig = {
      ...config,
      userData: token.apply(t => `#cloud-config\nyour-configuration-here\nK3S_TOKEN=${t}`),
    };

    const workerServer = new hcloud.Server(name, modifiedConfig);
    return pulumi.output(workerServer);
  }
   getNodeToken(server: hcloud.Server, name: string): pulumi.Output<string> {
    const tokenCommand = new command.local.Command(name, {
      create: `ssh user@${server.ipv4Address.apply(ip => ip)} 'cat /var/lib/rancher/k3s/server/node-token'`,
    },{dependsOn: [server]});

    return tokenCommand.stdout;
  }
   getConfig() {
    const fetchKubeconfig = new command.remote.Command("fetch-kubeconfig", {
      connection: {
        host: k3sVm.ipv4Address,
        user: "root",
        privateKey: sshKey.privateKeyPem,
      },
      create:
      // First, we use `until` to monitor for the k3s.yaml (our kubeconfig) being created.
      // Then we sleep 10, just in-case the k3s server needs a moment to become healthy. Sorry?
          "until [ -f /etc/rancher/k3s/k3s.yaml ]; do sleep 5; done; cat /etc/rancher/k3s/k3s.yaml; sleep 10;",
    });
  }
  const kubernetesProvider = new kubernetes.Provider("k3s", {
    kubeconfig: fetchKubeconfig.stdout,
  });


}
