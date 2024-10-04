import * as openstack from "@pulumi/openstack";
import * as pulumi from "@pulumi/pulumi";

import {ICloudOrchestrator} from "../../common/interfaces/ICloudOrchestrator";
import {Input, Output} from "@pulumi/pulumi";

export class OpenStackOrchestrator {
  private readonly provider: openstack.Provider;

  constructor(provider: openstack.Provider) {
    this.provider = provider;
  }

  createServer(
      sshKeys: Array<openstack.compute.Keypair>,
      userData: Input<string>,
      name: string
  ) {


    const floatingIp = new openstack.networking.FloatingIp("floating-ip", {
      address: "185.113.124.117",
      pool: "public",
      region: "fra",
      tenantId: "f3344e21ff8a4cb7b0b93ee5c53bf09c",
    }, {
      //provider: this.provider,
      protect: true,
    });
    const network1 = new openstack.networking.Network("network_1", {
      name: "network_1",
      adminStateUp: true,
    }, {provider: this.provider});

    const subnet = new openstack.networking.Subnet("subnet", {
      networkId: network1.id,
      name: "subnet1",
      cidr: "192.168.199.0/24",
    }, {provider: this.provider})

    const router = new openstack.networking.Router("router", {
      externalNetworkId: "5398ba00-40ee-42a3-bfcd-e7aad3db3bd8",
    }, {provider: this.provider})

    const routerInterface1 = new openstack.networking.RouterInterface("router_interface_1", {
      routerId: router.id,
      subnetId: subnet.id,
    }, {provider: this.provider});




    // const volume1 = new openstack.blockstorage.Volume("volume",
    //     {
    //       size: 32
    //     }, {provider: this.provider})

    const server = new openstack.compute.Instance("master", {
      accessIpV4: "192.168.0.106",
      availabilityZone: "az1",
      keyPair: sshKeys[0].name,
      imageName: "ubuntu-22.04-x86_64",
      imageId: "df5d5296-1c7d-4cc9-bbc2-3e4c2a2bc1a9",
      userData: userData,
      blockDevices: [{
        deleteOnTermination: true,
        sourceType: "image",
        destinationType: "volume",
        volumeSize: 32,
        uuid: "df5d5296-1c7d-4cc9-bbc2-3e4c2a2bc1a9"
      }],
      flavorId: "c142ae74-f3ba-4cf5-b240-f47dcf71f8d2",
      flavorName: "c5.xlarge",
      name: name,
      networks: [{
        accessNetwork: true,
        name: network1.name,
        uuid: network1.id,
      }],
      region: "fra",
      securityGroups: [
        "default",
      ],
    }, {
      provider: this.provider,
    });
    const port1 = new openstack.networking.Port("port_1", {
      name: "port_1",
      networkId: network1.id,
      deviceId: server.id,
      adminStateUp: true,
    }, {provider: this.provider});

   const associate = new openstack.networking.FloatingIpAssociate("associate",{
    floatingIp: floatingIp.address,
    fixedIp: server.accessIpV4,
    portId: port1.id
   }, {provider: this.provider})

    return server

  }
}
