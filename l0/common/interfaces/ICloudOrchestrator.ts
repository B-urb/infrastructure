import * as pulumi from "@pulumi/pulumi";
import {Output} from "@pulumi/pulumi";

export interface ICloudOrchestrator {
  createServer(sshKey: Array<string>,
                    network: any,
                    serverType: string,
                    userData: Output<string>,
                    name: string): pulumi.Output<any>
  createVolume(name: string, size: number): pulumi.Output<any>;
  createNetwork(name: string): pulumi.Output<any>;
  createSubnet(network: any, name: string): pulumi.Output<any>
  // ... other resource methods as needed ...
}