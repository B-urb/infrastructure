import {createDirectusHelmChart} from "./charts/Directus";
import {DirectusConfig, Source} from "../types/types";
import {createDirectusManual} from "./Manual/Directus";


export function createDirectus(by: Source, params: DirectusConfig) {
   switch (by) {
     case "manual":
       return createDirectusManual(params.namespace, params.secret, params.config)
     case "gke":
       console.log("Not Implemented")
       return null
     case "azure":
       console.log("Not Implemented")
       return null
     case "helm":
       return createDirectusHelmChart(params.namespace, params.secret, params.config)
     case "aws":
       console.log("Not Implemented")
       return null


   }
}