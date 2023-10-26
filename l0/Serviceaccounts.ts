import * as k8s from "@pulumi/kubernetes"
import {Namespace, ServiceAccount} from "@pulumi/kubernetes/core/v1";
import {Role} from "@pulumi/kubernetes/rbac/v1";



export function createServiceAccount(namespace: Namespace) {
  return new k8s.core.v1.ServiceAccount("gitlab-runner",
      {
        metadata: {
          name: "gitlab-runner",
          namespace: namespace.metadata.name
        }
      })
}
export function createRole(namespace:Namespace) {
  return new k8s.rbac.v1.Role("gitlab-runner", {
    metadata: {
      name: "gitlab-runner",
      namespace: namespace.metadata.name
    },
    rules: [
      { apiGroups: [""],
        resources: ["secrets","pods", "configmaps","service", "pods/attach", "pods/exec"],
        verbs: ["get", "list", "watch", "create", "delete", "update", "patch"]
        }
    ]
  })
}
export function createRoleBinding(namespace:Namespace, role: Role, serviceAccount: ServiceAccount) {
  return new k8s.rbac.v1.RoleBinding("gitlab-runner", {
    metadata: {
      name: "gitlab-runner",
      namespace: namespace.metadata.name
    },
    roleRef: {
      apiGroup: "rbac.authorization.k8s.io",
      kind: "Role",
      name: role.metadata.name},
    subjects: [{
      kind: "ServiceAccount",
      name: serviceAccount.metadata.name,
      namespace: namespace.metadata.name
    }]
  })

}