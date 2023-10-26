import {DirectusConfig, Source} from "../util/types";

import * as postgresql from "@pulumi/postgresql";
import {createPostgresHelm} from "./providers/charts/Postgres";
import {Namespace} from "@pulumi/kubernetes/core/v1";
import {RandomPassword} from "@pulumi/random";



export function createPostgres(by: Source, namespace: Namespace, dbRootPassword: RandomPassword, appDbPassword: RandomPassword) {
  switch (by) {
    case "manual":
      throw Error("Not Implemented")
    case "gke":
      console.log("Not Implemented")
      throw Error("Not Implemented")
    case "azure":
      console.log("Not Implemented")
      throw Error("Not Implemented")
    case "helm":
      return createPostgresHelm(namespace,dbRootPassword, appDbPassword)
    case "aws":
      console.log("Not Implemented")
      throw Error("Not Implemented")


  }
}

export function createDatabase(name: string) {
  const myDb = new postgresql.Database(name);

}