import {
  adminMail,
  adminPassword,
  dbBackupUser,
  dbPassword,
  dbUsername,
  mailgunKey,
  s3UserKey,
  s3UserSecret
} from "../util/env";


export const directusSecret = {
  "db-user": dbUsername,
  "db-password": dbPassword,
  "admin-mail": adminMail,
  "admin-password": adminPassword,
  "db-name": "directus",
  "s3-user-key": s3UserKey,
  "s3-user-secret": s3UserSecret,
  "mg-api-key": mailgunKey,
  "directus-secret": "test"
}
export const backupSecret = {
  "db-user": dbBackupUser,
  "db-password": dbBackupUser,
  "s3-user-key": s3UserKey,
  "s3-user-secret": s3UserSecret,
}
