import {Source} from "../types/types";
import {Namespace} from "@pulumi/kubernetes/core/v1";
import {createRedisHelm} from "./charts/Redis";

export function createRedis(by: Source, namespace: Namespace) {
  switch (by) {
    case "manual":
      return null
    case "gke":
      console.log("Not Implemented")
      return null
    case "azure":
      console.log("Not Implemented")
      return null
    case "helm":
      return createRedisHelm(namespace)
    case "aws":
      console.log("Not Implemented")
      return null


  }
}