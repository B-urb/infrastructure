import * as hcloud from "@pulumi/hcloud"
import {Network, NetworkSubnet, Provider, Server, SshKey, Volume} from "@pulumi/hcloud";
import * as fs from "fs";
import {Input} from "@pulumi/pulumi";

const datacenterId = "fsn1-dc14"
export function createCluster(hcloudToken: Input<string>) {

  const publicKey = fs.readFileSync('~/.ssh/id_rsa.pub', 'utf8');

// Create the SSH key resource on Hetzner Cloud
  const hetznerSshKey = new hcloud.SshKey('standard', {
    publicKey: publicKey,
  });
  const provider = new hcloud.Provider("hcloud-provider", { token: hcloudToken})

}

function createNetwork(name: string, provider: Provider) {
  return  new hcloud.Network(name, {
    ipRange: "10.0.0.0/16" // Specify an appropriate IP range
  }, {provider: provider});
}

function createSubnet(network: Network, name: string) {
  return new hcloud.NetworkSubnet(name, {
        networkId: network.id.apply(id => parseInt(id)),
        type: "cloud",
        networkZone: "eu-central",
        ipRange: "10.0.1.0/24",
      }
  );
}

function createServer(
    sshKey: SshKey,
    network: Network,
    subnet: NetworkSubnet,
    serverType: string,
    name: string,
    hcloudToken: string,
    provider: Provider
) {

  const primaryIpv4 = new hcloud.PrimaryIp(`${name}-primary_ip-v4`, {
    datacenter: datacenterId,
    type: "ipv4",
    assigneeType: "server",
    autoDelete: true,
    labels: {
      hallo: "welt",
    },
  }, {provider: provider});
  const primaryIpv6 = new hcloud.PrimaryIp(`${name}-primary_ip-v6`, {
    datacenter: datacenterId,
    type: "ipv6",
    assigneeType: "server",
    autoDelete: true,
    labels: {
      hallo: "welt",
    },
  }, {provider: provider});
  const volume = createVolume(name, provider)
  const server = new hcloud.Server(name, {
    serverType: "cax21",
    image: "ubuntu-22.04.2-live-server-arm64.iso",
    location: datacenterId,
    sshKeys: [sshKey.name],
    publicNets: [
      {
        ipv4Enabled: true,
        ipv4: primaryIpv4.id.apply(id => parseInt(id)),
        ipv6Enabled: true,
        ipv6: primaryIpv6.id.apply(id => parseInt(id)),
      }],
    networks: [{
      networkId: network.id.apply(id => parseInt(id)),
      ip: "10.0.1.10" // Specify an appropriate static IP if needed
    }],
  }, {provider: provider});
  attachVolumeToServer(volume, server, provider)
  return server
}

function createVolume(name: string, provider: Provider) {
  return new hcloud.Volume(name, {
    size: 25, // Size of the volume in GB
    location: datacenterId, // Specify the location
    format: "ext4", // Specify the format (optional)
  }, {provider: provider});
}

function attachVolumeToServer(volume: Volume, server: Server, provider: Provider) {
  const main = new hcloud.VolumeAttachment(`${server.name}-${volume.name}`, {
    volumeId: volume.id.apply(id => parseInt(id)),
    serverId: server.id.apply(id => parseInt(id)),
    automount: true,
  }, {provider: provider});
}