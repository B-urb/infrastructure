import * as hcloud from "@pulumi/hcloud";
import {ICloudServer} from "../../../l0/common/interfaces/ICloudServer";
import * as hcloud from "@pulumi/hcloud"
import {Network, NetworkSubnet, Provider, Server, SshKey, Volume} from "@pulumi/hcloud";
import * as fs from "fs";
import {Input, interpolate} from "@pulumi/pulumi";
class HetznerCloudServer implements ICloudServer<hcloud.ServerArgs, hcloud.Server> {
  private server: hcloud.Server;
  private datacenterId = "fsn1-dc14";
  private location = "fsn1";
  constructor(name: string, config: hcloud.ServerArgs) {
    this.server = new hcloud.Server(name, config);
  }

  getServerInfo(): string {
    // Implement method to return server information
    return `Hetzner Server: ${this.server.id.apply(id => id.toString())}`;
  }





}