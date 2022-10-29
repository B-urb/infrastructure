import * as k8s from "@pulumi/kubernetes";
import {Htpasswd, HtpasswdAlgorithm} from "pulumi-htpasswd";
import {Namespace, Secret} from "@pulumi/kubernetes/core/v1";


export function createGitlabSecret(username: string, token: string, namespace: Namespace): k8s.core.v1.Secret {
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
      namespace: namespace.metadata.name
    },
    type: "kubernetes.io/dockerconfigjson",
    data: {
      ".dockerconfigjson": encodedSecret
    }
  });
}
function createDirectusGitlabSecret(username: string, token: string): k8s.core.v1.Secret {
  let secretData = {
    "auths":
        {
          "registry.gitlab.com":
              {"auth": Buffer.from(username + ":" + token).toString('base64')}
        }
  };
  let encodedSecret = Buffer.from(JSON.stringify(secretData)).toString('base64')
  console.log(encodedSecret);

  return new k8s.core.v1.Secret('gitlab-pull-secret-directus', {
    metadata: {
      namespace: namespaceDirectus.metadata.name
    },
    type: "kubernetes.io/dockerconfigjson",
    data: {
      ".dockerconfigjson": encodedSecret
    }
  });
}

//TODO: Generalize function create secret
export function createGitlabSecretBahrenberg(username: string, token: string, namespace: Namespace): k8s.core.v1.Secret {
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
      namespace: namespace.metadata.name
    },
    type: "kubernetes.io/dockerconfigjson",
    data: {
      ".dockerconfigjson": encodedSecret
    }
  });
}

export function createDirectusS3Secret(userKey: string, userSecret: string, namespace: Namespace) {
  return new k8s.core.v1.Secret("directus-release-s3", {
    metadata: {
      name: "directus-s3",
      namespace: namespace.metadata.name
    },
    stringData: {
      "user-key": userKey,
      "user-secret": userSecret
    }
  })
}

export function createEtcdSecret(rootPassword: string, namespace: Namespace) {
  return new k8s.core.v1.Secret("etcd", {
    metadata: {
      name: "etcd",
      namespace: namespace.metadata.name
    },
    stringData: {
      "root-password": rootPassword
    }
  })
}

export function createMariaDBBackupSecret(user: string, password: string, namespace: Namespace) {
  return new k8s.core.v1.Secret("mariadb-backup", {
    metadata: {
      name: "mariadb-backup",
      namespace: namespace.metadata.name
    },
    stringData: {
      "user": user,
      "password": password
    }
  })
}

export function createBasicAuthSecret(user: string, password: string) {

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

export function createMiddleware(secret: Secret) {
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



