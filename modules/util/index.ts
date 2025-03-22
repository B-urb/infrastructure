import * as pulumi from "@pulumi/pulumi";
import {parse, stringify} from "yaml";

export function updateKubeConfig(
    kubeconfig: pulumi.Input<string>,
    serverIp: pulumi.Input<string>,
    newContextName: string,
    newClusterName: string,
    newUserName: string
): pulumi.Output<string> {
  return pulumi.all([kubeconfig, serverIp]).apply(([kc, ip]) => {
    // Parse the YAML kubeconfig to JSON
    const config: KubeConfig = parse(kc);

    // Replace the server address in all clusters
    config.clusters.forEach((cluster: KubeCluster) => {
      if (cluster.name === 'default') {
        cluster.cluster.server = `https://${ip}:6443`;
        cluster.name = newClusterName;
      }
    });

    config.users.forEach((user: KubeUser) => {
      if (user.name === 'default') {
        user.name = newUserName; // Update cluster reference
      }
    });
    // Replace the context name in all contexts
    config.contexts.forEach((context: KubeContext) => {
      if (context.name === 'default') {
        context.context.cluster = newClusterName; // Update cluster reference
        context.name = newContextName; // Update context name
        context.context.user = newUserName
      }
    });


    // Update current-context if it was 'default'
    if (config['current-context'] === 'default') {
      config['current-context'] = newContextName;
    }

    // Convert the modified JSON back to YAML
    return stringify(config);
  });
}

interface KubeContext {
  context: {
    cluster: string;
    user: string;
  };
  name: string;
}

interface KubeConfig {
  clusters: KubeCluster[];
  contexts: KubeContext[];
  users: KubeUser[];
  'current-context': string;
  // Add other properties of kubeconfig as needed
}

interface KubeCluster {
  cluster: {
    server: string;
  };
  name: string;
}

interface KubeUser {
  user: {
    "client-certificate-data": string;
    "client-key-data": string;
  };
  name: string;
}

interface KubeContext {
  context: {
    cluster: string;
    user: string;
  };
  name: string;
}

interface KubeConfig {
  clusters: KubeCluster[];
  contexts: KubeContext[];
  'current-context': string;
  // Add other properties of kubeconfig as needed
}