import * as pulumi from "@pulumi/pulumi";

export interface ICloudOrchestrator {
  createServer(sshKey: Array<string>,
                    network: any,
                    serverType: string,
                    userData: string,
                    name: string): any
  createVolume(name: string, size: number): any;
  createNetwork(name: string): any;
  createSubnet(network: any, name: string): any
  // ... other resource methods as needed ...
}