import {createUmamiManual} from "./Manual/Umami";
import {Namespace, Secret} from "@pulumi/kubernetes/core/v1";
import {Source} from "../types/types";

export function createUmami(by: Source, namespace: Namespace, secret: Secret) {
  switch (by) {
    case "manual":
      return createUmamiManual(namespace, secret)
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