import * as pulumi from "@pulumi/pulumi"
import {Input, Output} from "@pulumi/pulumi";

export const masterConfig = (k3sToken: Input<string>, disableFlannel: boolean): Output<string> => {
  return pulumi.interpolate`
  #cloud-config
  users:
    - name: k3s-user
  groups: sudo
  shell: /bin/bash
  runcmd:
    - | 
      curl -sfL https://get.k3s.io | K3S_TOKEN=${k3sToken} K3S_KUBECONFIG_MODE="644" sh -s - server \
      ${disableFlannel ? "--flannel-backend none --disable-network-policy" : ""} \
      --cluster-init 
  `;
}

export const workerConfig = (masterIp: Output<string>, k3sToken: Input<string>, disableFlannel: boolean, worker: boolean = true): Output<string> => {
  return pulumi.interpolate`
  #cloud-config
  users:
    - name: k3s-user
  groups: sudo
  shell: /bin/bash
  runcmd:
    - | 
      curl -sfL https://get.k3s.io | K3S_TOKEN=${k3sToken} K3S_KUBECONFIG_MODE="644" K3S_URL=https://${masterIp}:6443 sh -s - ${worker ? "agent" : "server"} \
      ${disableFlannel ? "--flannel-backend none --disable-network-policy" : ""}
  `;
}