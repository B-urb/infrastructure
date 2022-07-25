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

  function createDirectusS3Secret(userKey: string, userSecret: string) {
  return new k8s.core.v1.Secret("directus-release-s3", {
    stringData: {
      "user-key": userKey,
      "user-secret": userSecret
    }
  })
  }
const pullSecret = process.env.CI_PULL_SECRET!
const s3UserKey = process.env.CI_DIRECTUS_S3_KEY!
const s3UserSecret = process.env.CI_DIRECTUS_S3_SECRET!

export const directusS3Secret = createDirectusS3Secret(s3UserKey, s3UserSecret);
export const gitlabSecret = createGitlabSecret("pulumi",pullSecret);