import * as pulumi from "@pulumi/pulumi"
import {Input, Output} from "@pulumi/pulumi";
import {Keypair} from "@pulumi/openstack/compute/keypair";

export const masterConfigWithSsh = (k3sToken: Input<string>, disableFlannel: boolean, sshKey: Keypair[], masterIp: Input<string>): Output<string> => {
  return pulumi.interpolate`
#cloud-config
package_update: true
packages:
  - curl
runcmd:
  - [ sh, -c, "curl -sfL https://get.k3s.io | K3S_TOKEN='your_actual_token' K3S_KUBECONFIG_MODE='644' sh -s - server --cluster-init --tls-san ${masterIp}" ]
    `;
}
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
export const workerConfigWithSSH = (masterIp: Output<string>, k3sToken: Input<string>, disableFlannel: boolean, isWorker: boolean = true, sshKey: Input<string>[]): Output<string> => {
  return pulumi.interpolate`
#cloud-config
users:
  - name: ubuntu
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    shell: /bin/bash
    ssh_authorized_keys:
      - ${sshKey[0]}
      - ${sshKey[1]}
  - name: k3s-user
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    shell: /bin/bash
      
runcmd:
  - |
    curl -sfL https://get.k3s.io | K3S_TOKEN=${k3sToken} K3S_KUBECONFIG_MODE="644" sh -s - server \
    ${disableFlannel ? "--flannel-backend none --disable-network-policy" : ""} \
    --cluster-init 
     `;

}
export const workerConfig = (masterIp: Output<string>, k3sToken: Input<string>, disableFlannel: boolean, isWorker: boolean = true): Output<string> => {
  return pulumi.interpolate`
  #cloud-config
  users:
    - name: k3s-user
  groups: sudo
  shell: /bin/bash
  runcmd:
    - | 
      curl -sfL https://get.k3s.io | K3S_TOKEN=${k3sToken} K3S_URL=https://${masterIp}:6443 sh -s - ${isWorker ? "agent" : "server"} \
      ${disableFlannel && !isWorker ? "--flannel-backend none --disable-network-policy" : ""}
  `;
}