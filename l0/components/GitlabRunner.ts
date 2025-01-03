import * as k8s from "@pulumi/kubernetes";
import {Namespace} from "@pulumi/kubernetes/core/v1";
import {createService} from "../../src/resources/kubernetes/Service";
import {createRole, createRoleBinding, createServiceAccount} from "../Serviceaccounts";

const runnerToken = process.env.RUNNER_REGISTRATION_TOKEN!
const runnerConfig = process.env.RUNNER_CONFIG!


export function createGitlabRunner(namespace: Namespace) {
  const serviceAccount = createServiceAccount(namespace)
  const role = createRole(namespace)
  const roleBinding = createRoleBinding(namespace, role, serviceAccount)
  return new k8s.helm.v4.Chart("gitlab-runner", {
    chart: "gitlab-runner",
    namespace: namespace.metadata.name,
    repositoryOpts: {
      repo: "https://charts.gitlab.io/"
    },
    values: {
      gitlabUrl: "https://gitlab.com",
      runnerRegistrationToken: runnerToken,

      nodeSelector: {
        owner: "bjoern"
      },
      rbac: {
        create: false,
        serviceAccountName: serviceAccount.metadata.name
      },
      runners: {
        config: runnerConfig,
        privileged: true
      }
    }
  })
}