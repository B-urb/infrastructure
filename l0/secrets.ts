import {Htpasswd, HtpasswdAlgorithm} from "pulumi-htpasswd";
import * as k8s from "@pulumi/kubernetes";

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
