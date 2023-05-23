import {dbPassword, dbUsername, mailgunKey, redisDBPassword} from "../util/env";

export const mailgunConfig = {
  host: "api.eu.mailgun.com",
  apiKey: mailgunKey,
  sendDomain: "mg.burban.me"
}



export const s3Config = {
  "s3-bucket": "directus-backup"
}

export const directusConfigMapData = {
  PUBLIC_URL: "https://cms.tecios.de",
  "db-client": "pg",
  "db-host": "postgres-postgresql.postgres",
  "db-port": "5432",
  "s3-bucket": "directus",
  "directus-key": "bjoern"

}
