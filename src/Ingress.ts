import {WebService} from "./types/WebService";
import * as k8s from "@pulumi/kubernetes"


export function createIngresses(webservices: Array<WebService>): Array<k8s.networking.v1.Ingress> {

  return webservices.map(webservice =>
      new k8s.networking.v1.Ingress(webservice.name, {
        metadata: {
          annotations: {
                "kubernetes.io/ingress.class": "traefik",
  "cert-manager.io/cluster-issuer": "letsencrypt"
        }},
            spec: {
              tls: [{
                secretName: webservice.name + "-tls",
                hosts: [webservice.url]
              }],
              rules: [
                {
                  host: webservice.url,
                  http: {
                    paths: [{
                      pathType: "Prefix",
                      path: "/",
                      backend: {service: {name: webservice.name, port:{number: 80 }}}
                    }]
                  }
                }]

            }
          }
      ));

}
