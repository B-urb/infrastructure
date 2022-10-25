import {createDirectusHelmChart} from "./charts/Directus";
import {Source} from "../types/types";


export function createDirectus(by: Source) {
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
       return createDirectusHelmChart()
     case "aws":
       console.log("Not Implemented")
       return null


   }
}