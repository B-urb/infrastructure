import {WebService} from "./types/WebService";
import * as k8s from "@pulumi/kubernetes"
import {namespaceBurban} from "./namespace";


export function createIngresses(webservices: Array<WebService>): Array<k8s.networking.v1.Ingress> {

  return webservices.map(webservice =>
      new k8s.networking.v1.Ingress(webservice.name, {
        metadata: {
          annotations: {
                "kubernetes.io/ingress.class": "traefik",
  "cert-manager.io/cluster-issuer": "letsencrypt",
            "traefik.ingress.kubernetes.io/router.entrypoints.web.address": ":80",
            "traefik.ingress.kubernetes.io/router.entrypoints.web.http.redirections.entryPoint.to": "websecure",
            "traefik.ingress.kubernetes.io/router.entrypoints.web.http.redirections.entryPoint.scheme": "https",
            "traefik.ingress.kubernetes.io/router.entrypoints.websecure.address": ":443",
            ...webservice.ingressAnnotations
        },
          namespace: namespaceBurban.metadata.name
        },

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
                      backend: {service: {name: webservice.name, port:{number: 443 }}}
                    }]

                  }
                }]

            }
          }
      ));

}
