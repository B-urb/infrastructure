import * as k8s from "@pulumi/kubernetes";

 function createNamespace() {
   return new k8s.core.v1.Namespace("directus", {
     metadata: {
       name: "directus",
     }
   })
 }

export const namespace = createNamespace()