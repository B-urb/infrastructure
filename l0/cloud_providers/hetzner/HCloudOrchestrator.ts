import * as hcloud from "@pulumi/hcloud";
import * as pulumi from "@pulumi/pulumi";

import {ICloudOrchestrator} from "../../common/interfaces/ICloudOrchestrator";
import {Input, Output} from "@pulumi/pulumi";
import {HCloudServer} from "./HCloudServer";

export class HCloudOrchestrator implements ICloudOrchestrator {

  private readonly provider: hcloud.Provider
  private datacenterId: string
  private location: string

  constructor(token:Input<string>, datacenterId: string, location: string) {
    this.provider = new hcloud.Provider("hcloud-provider", { token: token})

    this.datacenterId = datacenterId
    this.location = location
  }

  createNetwork(name: string) {
    return new hcloud.Network(name, {
      ipRange: "10.0.0.0/16" // Specify an appropriate IP range
    }, {provider: this.provider});
  }

  createSubnet(network: hcloud.Network, name: string) {
    return new hcloud.NetworkSubnet(name, {
          networkId: network.id.apply(id => parseInt(id)),
          type: "cloud",
          networkZone: "eu-central",
          ipRange: "10.0.1.0/24",
        }
    );
  }

  createServer(
      publicKeys: Array<string>,
      network: hcloud.Network,
      serverType: string,
      name: string,
  ) {

    const  sshKeys = publicKeys.map(it => new hcloud.SshKey("standard", {
      publicKey: it,
    }, {provider: this.provider}));
    const primaryIpv4 = new hcloud.PrimaryIp(`${name}-primary_ip-v4`, {
      datacenter: this.datacenterId,
      type: "ipv4",
      assigneeType: "server",
      autoDelete: true,
      labels: {
        hallo: "welt",
      },
    }, {provider: this.provider});
    const primaryIpv6 = new hcloud.PrimaryIp(`${name}-primary_ip-v6`, {
      datacenter: this.datacenterId,
      type: "ipv6",
      assigneeType: "server",
      autoDelete: true,
      labels: {
        hallo: "welt",
      },
    }, {provider: this.provider});
    //const volume = this.createVolume(name)
    const server = new hcloud.Server(name, {
      serverType: serverType,
      datacenter: this.datacenterId,
      image: "ubuntu-22.04",
      sshKeys: sshKeys.map(it => it.name),
      publicNets: [
        {
          //ipv4Enabled: true,
          //ipv4: primaryIpv4.id.apply(id => parseInt(id)),
          ipv6Enabled: true,
          //ipv6: primaryIpv6.id.apply(id => parseInt(id)),
        }],
      networks: [{
        networkId: network.id.apply(id => parseInt(id)),
      }],
    }, {provider: this.provider});
    //this.attachVolumeToServer(volume, server)
    return server
  }

  createVolume(name: string) {
    return new hcloud.Volume(`${name}-volume`, {
      size: 25, // Size of the volume in GB
      location: this.location,
      format: "ext4", // Specify the format (optional)
    }, {provider: this.provider});
  }

  attachVolumeToServer(volume: hcloud.Volume, server: hcloud.Server) {
    const main = new hcloud.VolumeAttachment("attach", {
      volumeId: volume.id.apply(id => parseInt(id)),
      serverId: server.id.apply(id => parseInt(id)),
      automount: true,
    }, {provider: this.provider});
  }


  // ... other resource methods as needed ...
}