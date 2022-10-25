import {createDirectusHelmChart} from "./charts/Directus";
import {DirectusConfig, Source} from "../types/types";


export function createDirectus(by: Source, config: DirectusConfig) {
   switch (by) {
     case "manual":
       console.log("Not Implemented")
       return null
     case "gke":
       console.log("Not Implemented")
       return null
     case "azure":
       console.log("Not Implemented")
       return null
     case "helm":
       return createDirectusHelmChart(config.namespace, config.secret, config.vars)
     case "aws":
       console.log("Not Implemented")
       return null


   }
}