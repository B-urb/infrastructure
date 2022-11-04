import {Source} from "../types/types";
import {Namespace, Secret} from "@pulumi/kubernetes/core/v1";
import {createMedusaManual} from "./Manual/Medusa";

export function createMedusa(by: Source, namespace: Namespace, secret: Secret) {
  switch (by) {
    case "manual":
      return createMedusaManual(namespace, secret)
    case "gke":
      console.log("Not Implemented")
      return null
    case "azure":
      console.log("Not Implemented")
      return null
    case "helm":
      console.log("Not Implemented")
      return null
    case "aws":
      console.log("Not Implemented")
      return null


  }
}