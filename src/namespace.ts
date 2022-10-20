import * as k8s from "@pulumi/kubernetes";
import exp = require("constants");
import {create} from "domain";

 function createNamespace(name:string) {
   return new k8s.core.v1.Namespace(name, {
     metadata: {
       name: name,
     }
     })
 }

 export const namespacePostgres = createNamespace("postgres");
export const namespacePlausible = createNamespace("plausible");
export const namespaceClickhouse = createNamespace("clickhouse");
export const namespaceBurban = createNamespace("burban")
export const namespaceDirectus = createNamespace("directus")
export const namespaceEtcd = createNamespace("etcd")
export const namespaceGitlab = createNamespace("gitlab")
export const namespaceBahrenberg = createNamespace("bahrenberg")