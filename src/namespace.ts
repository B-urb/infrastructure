import * as k8s from "@pulumi/kubernetes";

 function createNamespace(name:string) {
   return new k8s.core.v1.Namespace(name, {
     metadata: {
       name: name,
     }
     })
 }

 export const namespaceBurban = createNamespace("burban")
export const namespaceDirectus = createNamespace("directus")
export const namespaceEtcd = createNamespace("etcd")
export const namespaceGitlab = createNamespace("gitlab")
export const namespaceBahrenberg = createNamespace("bahrenberg")