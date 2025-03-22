import * as hcloud from "@pulumi/hcloud";
import * as pulumi from "@pulumi/pulumi";

import {ICloudServer} from "../../../l0/common/interfaces/ICloudServer";

export class HCloudServer implements ICloudServer {
  private server: hcloud.Server;

  constructor(name: string, config: hcloud.ServerArgs) {
    this.server = new hcloud.Server(name, config);
  }

  getServerInfo(): string {
    // Implement method to return server information
    return `Hetzner Server: ${this.server.id.apply(id => id.toString())}`;
  }
}
