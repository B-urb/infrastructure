import {WebService} from "./types/WebService";
import * as k8s from "@pulumi/kubernetes";


function createGitlabSecret(username: string, token: string): k8s.core.v1.Secret {


  let secretData  = {
    "auths":
        {
          "registry.gitlab.com":
              {"auth": Buffer.from(username + ":" + token).toString('base64')}
        }};
  let encodedSecret = Buffer.from(JSON.stringify(secretData)).toString('base64')
  console.log(encodedSecret);

    return new k8s.core.v1.Secret('gitlab-pull-secret', {
      type: "kubernetes.io/dockerconfigjson",
      data: {
        ".dockerconfigjson": encodedSecret
      }
    });
  }
const pullSecret = process.env.CI_PULL_SECRET!
export const gitlabSecret = createGitlabSecret("pulumi",pullSecret);