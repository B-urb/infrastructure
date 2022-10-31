import {DirectusConfig, Source} from "../types/types";

import * as postgresql from "@pulumi/postgresql";
import {createPostgresHelm} from "./charts/Postgres";
import {Namespace} from "@pulumi/kubernetes/core/v1";



export function createPostgres(by: Source, namespace: Namespace) {
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
      return createPostgresHelm(namespace)
    case "aws":
      console.log("Not Implemented")
      return null


  }
}

export function createDatabase(name: string) {
  const myDb = new postgresql.Database(name);

}