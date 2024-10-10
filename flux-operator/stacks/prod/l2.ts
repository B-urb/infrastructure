import {Secret} from "@pulumi/kubernetes/core/v1";
import {CustomResource} from "@pulumi/kubernetes/apiextensions";

export function createStackL2Prod(ns: string, accessToken: Secret, tagL2: string) {
  const stackL2 = new CustomResource("l2", {
    apiVersion: 'pulumi.com/v1',
    kind: 'Stack',
    metadata: {
      name: "l2",
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
      refresh: true,
      useLocalStackOnly: true,
      projectRepo: "https://github.com/B-Urb/infrastructure",
      repoDir: "/l2",
      branch: tagL2,
      prerequisites: [
        {name: "l1"}
      ],
      retryOnUpdateConflict: true,
      destroyOnFinalize: true,
    }
  });

}