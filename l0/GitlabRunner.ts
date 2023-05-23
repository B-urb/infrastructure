import * as k8s from "@pulumi/kubernetes";
import {serviceAccount} from "./Serviceaccounts";
import {Namespace} from "@pulumi/kubernetes/core/v1";

const runnerToken = process.env.RUNNER_REGISTRATION_TOKEN!
const runnerConfig = process.env.RUNNER_CONFIG!


export function createGitlabRunner(namespace: Namespace) {
  return new k8s.helm.v3.Chart("gitlab-runner", {
    chart: "gitlab-runner",
    namespace: namespace.metadata.name,
    fetchOpts: {
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