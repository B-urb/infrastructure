import {
  adminMail,
  adminPassword, dbBackupPassword,
  dbBackupUser,
  dbPassword,
  dbUsername,
  mailgunKey, medusaPassword, medusaUser, redisDBPassword,
  s3UserKey,
  s3UserSecret, umamiPassword, umamiUser
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
  "db-password": dbBackupPassword,
  "s3-user-key": s3UserKey,
  "s3-user-secret": s3UserSecret,
}
export const umamiSecret = {
  "db-connection-string": `postgresql://${umamiUser}:${umamiPassword}@postgres-postgresql.postgres:5432/umami`
}
export const medusaSecret = {
  "postgres-connection-string": `postgresql://${medusaUser}:${medusaPassword}@postgres-postgresql.postgres:5432/medusa`,
  "redis-connection-string": `redis://redis-headless.redis:6379?ConnectTimeout=5000&password=${redisDBPassword}&IdleTimeOutSecs=180`
}