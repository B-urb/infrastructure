import {ConfigMap, Namespace, Secret} from "@pulumi/kubernetes/core/v1";
import {createRustdeskManual} from "./providers/Manual/Rustdesk";


export function createRustdesk(by: string, namespace: Namespace, secret: Secret, config: ConfigMap) {
   switch (by) {
     case "manual":
       return createRustdeskManual(namespace, secret, config)
     case "gke":
       console.log("Not Implemented")
       return null
     case "azure":
       console.log("Not Implemented")
       return null
     case "helm":
       return createRustdeskManual(namespace, secret, config)
     case "aws":
       console.log("Not Implemented")
       return null


   }
}