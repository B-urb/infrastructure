import * as k8s from "@pulumi/kubernetes";
import {namespaceBahrenberg, namespaceBurban, namespaceDirectus, namespaceEtcd} from "./namespace";
import {Htpasswd, HtpasswdAlgorithm} from "pulumi-htpasswd";
import {Secret} from "@pulumi/kubernetes/core/v1";


function createGitlabSecret(username: string, token: string): k8s.core.v1.Secret {
  let secretData = {
    "auths":
        {
          "registry.gitlab.com":
              {"auth": Buffer.from(username + ":" + token).toString('base64')}
        }
  };
  let encodedSecret = Buffer.from(JSON.stringify(secretData)).toString('base64')
  console.log(encodedSecret);

  return new k8s.core.v1.Secret('gitlab-pull-secret', {
    metadata: {
      namespace: namespaceBurban.metadata.name
    },
    type: "kubernetes.io/dockerconfigjson",
    data: {
      ".dockerconfigjson": encodedSecret
    }
  });
}

//TODO: Generalize function create secret
function createGitlabSecretBahrenberg(username: string, token: string): k8s.core.v1.Secret {
  let secretData = {
    "auths":
        {
          "registry.gitlab.com":
              {"auth": Buffer.from(username + ":" + token).toString('base64')}
        }
  };
  let encodedSecret = Buffer.from(JSON.stringify(secretData)).toString('base64')
  console.log(encodedSecret);

  return new k8s.core.v1.Secret('gitlab-pull-secret-bahrenberg', {
    metadata: {
      namespace: namespaceBahrenberg.metadata.name
    },
    type: "kubernetes.io/dockerconfigjson",
    data: {
      ".dockerconfigjson": encodedSecret
    }
  });
}

function createDirectusS3Secret(userKey: string, userSecret: string) {
  return new k8s.core.v1.Secret("directus-release-s3", {
    metadata: {
      name: "directus-s3",
      namespace: namespaceDirectus.metadata.name
    },
    stringData: {
      "user-key": userKey,
      "user-secret": userSecret
    }
  })
}

function createEtcdSecret(rootPassword: string) {
  return new k8s.core.v1.Secret("etcd", {
    metadata: {
      name: "etcd",
      namespace: namespaceEtcd.metadata.name
    },
    stringData: {
      "root-password": rootPassword
    }
  })
}

function createMariaDBBackupSecret(user: string, password: string) {
  return new k8s.core.v1.Secret("mariadb-backup", {
    metadata: {
      name: "mariadb-backup",
      namespace: namespaceDirectus.metadata.name
    },
    stringData: {
      "user": user,
      "password": password
    }
  })
}

function createBasicAuthSecret(user: string, password: string) {

  const credentials = new Htpasswd('credentials', {
    algorithm: HtpasswdAlgorithm.Bcrypt,
    entries: [{
      // example with a specific username + password
      username: user,
      password: password,
    }],
  });

  const authString = credentials.result

  return new k8s.core.v1.Secret("basic-auth", {
    metadata: {
      name: "basic-auth",
      namespace: "kube-system"
    },
    stringData: {
      "users": authString,
    }
  })
}

function createMiddleware(secret: Secret) {
  return new k8s.apiextensions.CustomResource("middleware-ba", {
    apiVersion: "traefik.containo.us/v1alpha1",
    kind: "Middleware",
    metadata: {
      name: "basic-auth",
      namespace: "kube-system"
    },
    spec: {
      basicAuth: {
        secret: secret.metadata.name
      }
    }
  })
}


const pullSecret = process.env.CI_PULL_SECRET!
const s3UserKey = process.env.CI_DIRECTUS_S3_KEY!
const s3UserSecret = process.env.CI_DIRECTUS_S3_SECRET!
const mariaDBBackupUser = process.env.CI_BACKUP_USER!
const mariaDBBackupPassword = process.env.CI_BACKUP_PASSWORD!
const etcdRootPassword = process.env.CI_DB_ROOT_PASSWORD!;
const basicAuthUser = process.env.CI_BASIC_AUTH_USER!;
const basicAuthPassword = process.env.CI_BASIC_AUTH_PASSWORD!;

const baSecret = createBasicAuthSecret(basicAuthUser, basicAuthPassword);
const middleware = createMiddleware(baSecret)

export const etcdSecret = createEtcdSecret(etcdRootPassword);
export const mariaDbBackupSecret = createMariaDBBackupSecret(mariaDBBackupUser, mariaDBBackupPassword);
export const directusS3Secret = createDirectusS3Secret(s3UserKey, s3UserSecret);
export const gitlabSecret = createGitlabSecret("pulumi", pullSecret);
export const bahrenbergGitlab = createGitlabSecretBahrenberg("pulumi", pullSecret)