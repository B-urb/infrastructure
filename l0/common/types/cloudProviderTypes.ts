import * as hcloud from "@pulumi/hcloud"
export type CloudProviderTypes = {
  Hetzner: {
    Server: hcloud.Server,
    Volume: hcloud.Volume,
    Network: hcloud.Network
  },
  // Azure: {
  //   Server: AzureServer,
  //   Volume: AzureVolume,
  //   Network: AzureNetwork
  // },
  // Add other cloud providers as needed
};
// // Example types for Hetzner
// type HetznerServer = hcl;
// type HetznerVolume = /* ... */;
// type HetznerNetwork = /* ... */;
//
// // Example types for Azure
// type AzureServer = /* ... */;
// type AzureVolume = /* ... */;
// type AzureNetwork = /* ... */;
