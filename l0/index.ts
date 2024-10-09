import * as pulumi from "@pulumi/pulumi";
import {createHetznerK3S} from "./create/Hetzner";
import {getStack, Output} from "@pulumi/pulumi";
import {createOpenstackK3S} from "./create/Openstack";


const stack = getStack()

const config = new pulumi.Config();
const clusterName = "urban"
const mail = config.get("emailAdress")!!

if (!(stack == "hetzner" || stack == "openstack")) {
  throw Error("invalid stack")
}

const result = getKubeConfigAndCluster(stack, clusterName, mail)
export const kubeconfig = result.kubeconfig
export const cluster = result.cluster

function getKubeConfigAndCluster(stack: string, clusterName: string, mail: string): { kubeconfig: Output<string>, cluster: Output<string>} {
if (stack == "hetzner"){
  return createHetznerK3S(config, clusterName, mail)
}
  else if (stack == "openstack") {
    return createOpenstackK3S(config, clusterName, mail)
  } else {
    throw Error("invalid stack")
  }


}