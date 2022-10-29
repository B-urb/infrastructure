
export const pullSecret = process.env.CI_PULL_SECRET!
export const s3UserKey = process.env.CI_DIRECTUS_S3_KEY!
export const s3UserSecret = process.env.CI_DIRECTUS_S3_SECRET!
export const dbBackupUser = process.env.CI_BACKUP_USER!
export const dbBackupPassword = process.env.CI_BACKUP_PASSWORD!
export const etcdRootPassword = process.env.CI_DB_ROOT_PASSWORD!;
export const basicAuthUser = process.env.CI_BASIC_AUTH_USER!;
export const basicAuthPassword = process.env.CI_BASIC_AUTH_PASSWORD!;
export const adminPassword = process.env.CI_ADMIN_PASSWORD! as string
export const adminMail = process.env.CI_ADMIN_EMAIL! as string
export const dbPassword = process.env.CI_DB_PASSWORD!
export const dbUsername = process.env.CI_DB_USERNAME!
export const redisDBPassword = process.env.CI_REDIS_PASSWORD
export const dbRootPassword = process.env.CI_DB_ROOT_PASSWORD;
export const mailgunKey = process.env.CI_MAILGUN_KEY!;
