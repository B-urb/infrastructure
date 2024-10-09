import {CustomResource} from "@pulumi/kubernetes/apiextensions";
import {Secret} from "@pulumi/kubernetes/core/v1";

export function createStackL1Prod(ns: string, accessToken: Secret) {

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
      stack: "hetzner",
      projectRepo: "https://github.com/B-urb/infrastructure",
      repoDir: "/l1",
      branch: "master",
      retryOnUpdateConflict: true,
      destroyOnFinalize: true,
    }
  });
}