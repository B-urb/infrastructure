import {CustomResource} from "@pulumi/kubernetes/apiextensions";
import {Secret} from "@pulumi/kubernetes/core/v1";

export function createStackL1Dev(ns: string, accessToken: Secret) {

  const stackL1 = new CustomResource("l1", {
    apiVersion: 'pulumi.com/v1',
    kind: 'Stack',
    metadata: {
      name: "l1",
      namespace: ns
    },
    spec: {
      envRefs: {
        PULUMI_ACCESS_TOKEN: {
          type: "Secret",
          secret: {
            key: "accessToken",
            name: accessToken.metadata.name,
            namespace: ns,
          },
        }
      },
      stack: "openstack",
      useLocalStackOnly: true,
      projectRepo: "https://github.com/B-urb/infrastructure",
      repoDir: "/l1",
      refresh: true,
      branch: "development",
      retryOnUpdateConflict: true,
      destroyOnFinalize: true,
    }
  });
}