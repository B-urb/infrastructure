import {mailgunKey } from "../util/env";
import {Input} from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

export const mailgunConfig = {
  host: "api.eu.mailgun.com",
  apiKey: mailgunKey,
  sendDomain: "mg.burban.me"
}
export function createDirectusConfigMap(directusConfigMapData: Input<{[p: string]: Input<string>}>) {
  return new k8s.core.v1.ConfigMap("directus", {
    metadata: {
      namespace: "directus",
      name: "directus"
    },
    data: directusConfigMapData
  });
}


export const s3Config = {
  "s3-bucket": "directus-backup"
}


