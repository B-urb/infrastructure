import * as k8s from "@pulumi/kubernetes"
import {Namespace} from "@pulumi/kubernetes/core/v1";
import {Output} from "@pulumi/pulumi";

export type KubevoyageConfig = {
  url: string;
  adminUser: string;
  adminPassword: Output<string>;
  jwtSecret: Output<string>;
  dbUser: Output<string>;
  dbPassword: Output<string>;
  dbName: Output<string>;
  dbUrl: Output<string>;
}

export function createKubevoyageHelmChart(namespace: Namespace, config: KubevoyageConfig) {

  return new k8s.helm.v3.Chart("kubevoyage", {
        chart: "kubevoyage",
        version: "0.7.0",
        namespace: namespace.metadata.name,
        fetchOpts: {
          repo: "https://b-urb.github.io/KubeVoyage/",
        },
        values: {
          "image": {
            "tag": "v1.2.1-rc.8",
          },
          "ingress": {
            "enabled": "true",
            "tls": [{
              "secretName": "kubevoyage-tls",
              "hosts": [config.url]
            }],
            "hosts": [
              {
                "paths": [
                  {
                    "pathType": "ImplementationSpecific",
                    "path": "/",
                    "service": {
                      "name": "kubevoyage",
                      "port": 80
                    }
                  }
                ],
                "host": 'voyage.burban.me'
              }],
            "annotations": {
              "cert-manager.io/cluster-issuer": "letsencrypt"
            }
          },
          "auth": {
            "adminUser": config.adminUser,
            "adminPassword": config.adminPassword,
          },
          "additionalEnvVars": {
            "jwtSecret": config.jwtSecret,
            "baseUrl": "https://" + config.url,
          },
          "database": {
           "type": "postgres",
            "host": config.dbUrl,
            "port": "5123",
            "user": config.dbUser,
            "password": config.dbPassword,
            "name": config.dbName
          }

        },
      }
  );

}


