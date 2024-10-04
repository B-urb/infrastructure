import {CustomResource} from "@pulumi/kubernetes/apiextensions";
import {Secret} from "@pulumi/kubernetes/core/v1";

export function createStackL2Dev(ns: string, accessToken: Secret) {

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
      stack: "openstack",
      projectRepo: "https://github.com/B-Urb/infrastructure",
      repoDir: "/l2",
      branch: "development",
      prerequisites: [
        {name: "l1"}
      ],
      retryOnUpdateConflict: true,
      destroyOnFinalize: true,
    }
  });
}
