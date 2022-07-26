import * as k8s from "@pulumi/kubernetes"
import {WebService} from "./types/WebService";
import {directusS3Secret} from "./Secrets";


export function createService(webservices: Array<WebService>): Array<k8s.core.v1.Service> {

  return webservices.map(webservice =>
      new k8s.core.v1.Service(webservice.name, {
        "metadata": {
          name: webservice.name
        },
        "spec": {
          "ports": [
            {
              "name": "http",
              "port": 80,
              "protocol": "TCP",
              "targetPort": "http"
            }
          ],
          "selector": {
            "name": webservice.name
          }
        }
      }))
}


function createDirectusS3Service() {
  return new k8s.core.v1.Service("directus-s3", {
    "metadata": {
      name: "directus-s3"
    }, spec: {
      type: "ExternalName",
      externalName: "minio.minio.svc.cluster.local",
      ports: [{
        port: 9000,
        protocol: "TCP",
        targetPort: 80
      }]
    }
  })
}

export const directusS3Service = createDirectusS3Service()