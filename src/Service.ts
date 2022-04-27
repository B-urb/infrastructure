import * as k8s from "@pulumi/kubernetes"
import {WebService} from "./types/WebService";


export function createService(webservices: Array<WebService>): Array<k8s.core.v1.Service> {

  return webservices.map(webservice =>
      new k8s.core.v1.Service(webservice.name, {
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
            "name": "daniel"
          }
        }
      }))
}