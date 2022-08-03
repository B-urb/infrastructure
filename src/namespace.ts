import * as k8s from "@pulumi/kubernetes";

 function createDirectusNamespace() {
   return new k8s.core.v1.Namespace("directus", {
     metadata: {
       name: "directus",
     }
   })
 }

 function createMyNamespace() {
   return new k8s.core.v1.Namespace("burban", {
     metadata: {
       name: "burban",
     }
     })
 }

 export const namespaceBurban = createMyNamespace()
export const namespaceDirectus = createDirectusNamespace()