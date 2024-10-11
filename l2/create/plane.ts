import {Config, interpolate, StackReference} from "@pulumi/pulumi";
import {Database, Grant, Provider, Role} from "@pulumi/postgresql";
import {createS3Bucket} from "../s3";
import {dbUsername, redisDBPassword} from "../../util/env";
import {database} from "@pulumi/postgresql/config";
import {RandomPassword} from "@pulumi/random";
import {createNamespace} from "../namespace";
import createPlaneHelm from "../providers/Charts/Plane";


export function createPlane(postgresProvider: Provider, stackRef: StackReference, config: Config) {
  const planeSecretKey = new RandomPassword("plane-secret", {length: 24}).result.apply(
      password => interpolate`${password}`
  )
  const namespacePlane = createNamespace("plane")

  const postgresUrl = stackRef.getOutput("postgresUrl").apply(url => interpolate`${url}`)

  const password = new RandomPassword("planeDbPassword", {
    length: 16,
    special: true,
  });
// Create Database for PlaneCMS
  const role = new Role("plane", {
    login: true,
    name: "plane",
    password: password.result
  }, {provider: postgresProvider});
  const planeDb = new Database("plane", {name: "plane", owner: role.name}, {provider: postgresProvider});

  const grant = new Grant("planeFull", {
    database: planeDb.name,
    objectType: "database",
    privileges: ["ALL"],
    role: role.name,
  }, {provider: postgresProvider});


  const planeBucket = createS3Bucket("plane");
  const planeConfig = {
    url: "plane.burban.me",
    dbConnectionString: interpolate`postgresql://${role.name}:${password.result}@${postgresUrl}:5432/${planeDb.name}`,
    dbName: planeDb.name,
    awsS3Bucket: planeBucket.bucketName,
    awsS3Region: planeBucket.region,
    awsS3Endpoint: planeBucket.endpoint,
    s3UserKey: planeBucket.accessKeyId,
    s3UserSecret: planeBucket.secretAccessKey,
    planeKey: planeSecretKey,
    redisConnectionString: `redis://redis-headless.redis:6379?ConnectTimeout=5000&password=${redisDBPassword}&IdleTimeOutSecs=180`
  }
  const plane = createPlaneHelm(namespacePlane, planeConfig)
}