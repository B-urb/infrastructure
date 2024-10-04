import * as fs from "fs";
import * as cloudinit from "@pulumi/cloudinit"
import * as command from "@pulumi/command"
import * as pulumi from "@pulumi/pulumi";
import {CloudProviderTypes} from "../common/types/cloudProviderTypes";
import {masterConfig, workerConfig} from "./cloudinit";
import * as openstack from "@pulumi/openstack"
import {Input} from "@pulumi/pulumi";
import * as tls from "@pulumi/tls";
import {PrivateKey} from "@pulumi/tls";
import {updateKubeConfig} from "../utils";
import {RandomPassword} from "@pulumi/random";
import {OpenStackOrchestrator} from "../cloud_providers/openstack/OpenStackOrchestrator";
import { Keypair } from "@pulumi/openstack/compute/keypair";


export class K3sClusterDev<T extends keyof CloudProviderTypes> {
  private orchestrator: OpenStackOrchestrator;
  private provider: openstack.Provider;
  private k3sToken: RandomPassword;

  constructor(orchestrator: OpenStackOrchestrator, provider: openstack.Provider, k3sToken: RandomPassword) {
    this.provider = provider;
    this.orchestrator = orchestrator;
    this.k3sToken = k3sToken;
  }

  createCluster(name: string, useCilium: boolean, masterCount: number, agentCount: number) {
    if (masterCount < 1)
    {
      throw Error("Master Count must at least one or the cluster would be empty.")
    }

    const publicKeyHuman = fs.readFileSync('/Users/bjornurban/.ssh/id_rsa.pub', 'utf8');
    const sshKey = new tls.PrivateKey("sshKey", {
      algorithm: "RSA",
      rsaBits: 4096,
    });
    const publicKeys = Array.of(pulumi.output(publicKeyHuman), sshKey.publicKeyOpenssh)




    const sshKeys = publicKeys.map((it, index) => new Keypair(`ssh-${index}`, {
      name:`ssh-${index}`,
      publicKey: it
    }, {provider: this.provider}));


    const initialNode = this.orchestrator.createServer(sshKeys, masterConfig(this.k3sToken.result, useCilium), "master-main")
    for (let i = 0; i < masterCount - 1; i++) {
      const serverName = `master-${i+1}`
      this.orchestrator.createServer(sshKeys, workerConfig(initialNode.accessIpV4, this.k3sToken.result, useCilium, false), serverName)
    }

    for (let i = 0; i < agentCount; i++) {
      const serverName =  `node-${i}`
      this.orchestrator.createServer(sshKeys, workerConfig(initialNode.accessIpV4, this.k3sToken.result, useCilium, true), serverName)
    }

    const kubeconfig = this.getConfig(initialNode.accessIpV4, sshKey); // Assuming this returns the kubeconfig as a string
    const newContextName = `${name}`; // Replace with your new context name
    const newClusterName = `${name}`; // Replace with your new cluster name
    const updatedConfig = updateKubeConfig(kubeconfig, initialNode.accessIpV4, newContextName, newClusterName);
    // Call the function
    return {
      "ip": initialNode.accessIpV4,
      "sshKey": sshKey,
      "kubeconfig": updatedConfig
    }
  }

  getCloudInit(master: Boolean) {
    const k3sInstallPath = master ? "./install-k3s-master.sh" : "./install-k3s.sh"
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
          content: fs.readFileSync(k3sInstallPath, "utf8"),
        },
      ],
    });
  }


  getConfig(ip: Input<string>, sshKey: PrivateKey) {
    const fetchKubeconfig = new command.remote.Command("fetch-kubeconfig", {
      connection: {
        host: ip,
        user: "root",
        privateKey: sshKey.privateKeyPem,
      },
      create:
      // First, we use `until` to monitor for the k3s.yaml (our kubeconfig) being created.
      // Then we sleep 10, just in-case the k3s server needs a moment to become healthy. Sorry?
          "until [ -f /etc/rancher/k3s/k3s.yaml ]; do sleep 5; done; cat /etc/rancher/k3s/k3s.yaml; sleep 10;",
    });
    return fetchKubeconfig.stdout;
  }
}


