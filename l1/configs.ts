import {dbPassword, dbUsername, mailgunKey, redisDBPassword} from "../util/env";

export const postgresConfig = {
  user: dbUsername,
  password: dbPassword
}
export const redisConfig = {
  password: redisDBPassword
}

