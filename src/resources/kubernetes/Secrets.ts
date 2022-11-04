import * as k8s from "@pulumi/kubernetes";
import {Htpasswd, HtpasswdAlgorithm} from "pulumi-htpasswd";
import {Namespace, Secret} from "@pulumi/kubernetes/core/v1";
import {backupSecret, directusSecret, medusaSecret, umamiSecret} from "../secrets";
import * as pulumi from "@pulumi/pulumi"

export function createGitlabSecret(username: string, token: string,name:string, namespace: Namespace): k8s.core.v1.Secret {
  let secretData = {
    "auths":
        {
          "registry.gitlab.com":
              {"auth": Buffer.from(username + ":" + token).toString('base64')}
        }
  };
  let encodedSecret = Buffer.from(JSON.stringify(secretData)).toString('base64')
  const pullSecretName = pulumi.interpolate `gitlab-pull-secret-${namespace.metadata.name}`;
  return new k8s.core.v1.Secret(name, {
    metadata: {
      name: pullSecretName,
      namespace: namespace.metadata.name,
    },
    type: "kubernetes.io/dockerconfigjson",
    data: {
      ".dockerconfigjson": encodedSecret
    }
  });
}


export function createBackupSecret(namespace: Namespace) {
  return new k8s.core.v1.Secret("postgres-backup", {
    metadata: {
      name: "postgres-backup",
      namespace: namespace.metadata.name
    },
    stringData: backupSecret
  })
}
export function createUmamiSecret(namespace: Namespace) {
  return new k8s.core.v1.Secret("umami", {
    metadata: {
      name: "umami",
      namespace: namespace.metadata.name
    },
    stringData: umamiSecret
  })
}
export function createMedusaSecret(namespace: Namespace) {
  return new k8s.core.v1.Secret("medusa", {
    metadata: {
      name: "medusa",
      namespace: namespace.metadata.name
    },
    stringData: medusaSecret
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

export function createDbSecret(user: string, password: string, name: string, namespace: Namespace) {
  return new k8s.core.v1.Secret(name, {
    metadata: {
      name: name,
      namespace: namespace.metadata.name
    },
    stringData: {
      "user": user,
      "password": password
    }
  })
}

export function createDirectusSecret(name: string, namespace: Namespace) {
  return new k8s.core.v1.Secret("directus", {
    metadata: {
      name: name,
      namespace: namespace.metadata.name
    },
    stringData: directusSecret
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



