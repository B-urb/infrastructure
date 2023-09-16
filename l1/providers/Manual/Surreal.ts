import {ConfigMap, StatefulSet} from "@pulumi/kubernetesx";
import {keelAnnotationsProd} from "../../../util/globals";
import {Secret} from "@pulumi/kubernetes/core/v1";
import {RandomPassword} from "@pulumi/random";
import exp = require("constants");

const name = "surrealdb"
const namespace = "surrealdb"
const image = "surrealdb/surrealdb"
const tag = "1.0.0"

export const surrealPassword = new RandomPassword("surrealPassword",{length: 16, special: true})

export function createSurrealManual() {
 const secret = new Secret(name, {
  metadata: {
   name: name,
   namespace: namespace
  },
  stringData: {
   "surreal-user": "root",
   "surreal-password": surrealPassword.result
  }
 })

 const config = new ConfigMap(name, {
  metadata: {
   name: name,
   namespace: namespace
  },
  data: {
   "log-level": "error",
   "file-path": "/.surreal"
  }
 })
 new StatefulSet(name, {
  "metadata": {
   "name": name
  },
  "spec": {
   "serviceName": `${name}-service`,
   "replicas": 1,
   "selector": {
    "matchLabels": {
     "app": name
    }
   },
   "template": {
    "metadata": {
     "labels": {
      "app": name
     }
    },
    "spec": {
     // nodeSelector: {
     // },
     "containers": [
      {
       "name": name,
       "image": image + ":" + tag,
       "imagePullPolicy": "Always",
       "command": ["/bin/sh", "-c"],
       "args": [
        "surreal start --log $(LOG_LEVEL) --user $(SURREAL_USER) --pass $(SURREAL_PASSWORD) file:$(FILE_PATH)"
       ],
       "env": [
        {
         name: "FILE_PATH",
         valueFrom: {configMapKeyRef: {name: config.metadata.name, key: "file-path"}}
        },
        {
         "name": "LOG_LEVEL",
         "valueFrom": {
          "configMapKeyRef": {
           "name": config.metadata.name,
           "key": "log-level"
          }
         }
        },
        {
         name: "SURREAL_USER",
         valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "surreal-user"}}
        }, {
         name: "SURREAL_PASSWORD",
         valueFrom: {secretKeyRef: {name: secret.metadata.name, key: "surreal-password"}}
        }],
       "ports": [
        {
         "name": "surreal",
         "containerPort": 8000
        }
       ],
       "livenessProbe": {
        httpGet: {
         path: "/",
         port: "surreal"
        }
       },
       readinessProbe: {
        httpGet: {
         path: "/",
         port: "surreal"
        }
       },
       "volumeMounts": [
        {
         "name": "surreal-volume",
         "mountPath": "/.surreal"
        }
       ]
      }
     ],
     "volumes": [
      {
       "name": "surreal-volume",
       "persistentVolumeClaim": {
        "claimName": "surreal-pvc"
       }
      }
     ],
    }
   }
  }
 })
}