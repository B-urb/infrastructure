import * as k8s from "@pulumi/kubernetes";

export function createNamespace(name:string) {
   return new k8s.core.v1.Namespace(name, {
     metadata: {
       name: name,
     }
     })
 }

