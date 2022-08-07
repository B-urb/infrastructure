import * as k8s from "@pulumi/kubernetes"
import {namespaceGitlab} from "./namespace";



function createServiceAccount() {
  return new k8s.core.v1.ServiceAccount("gitlab-runner")
}
export const serviceAccount = createServiceAccount();
function createRole() {
  return new k8s.rbac.v1.Role("gitlab-runner", {
    metadata: {
      name: "gitlab-runner",
      namespace: namespaceGitlab.metadata.name
    },
    rules: [
      { apiGroups: [""],
        resources: ["secrets, pods, configmaps, pods/attach"],
        verbs: ["get", "list", "create", "delete", "update"]
        }
    ]
  })
}
const role = createRole();
function createRoleBinding() {
  return new k8s.rbac.v1.RoleBinding("gitlab-runner", {
    roleRef: {
      apiGroup: "rbac.authorization.k8s.io",
      kind: "Role",
      name: role.metadata.name},
    subjects: [{
      kind: "ServiceAccount",
      name: serviceAccount.metadata.name,
      namespace: namespaceGitlab.metadata.name
    }]
  })

}
createRoleBinding()