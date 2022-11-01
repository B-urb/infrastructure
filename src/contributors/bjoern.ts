import {createDeployments} from "../resources/WebDeployments";
import {WebService} from "../types/WebService";
import {createIngresses} from "../resources/kubernetes/Ingress";
import {createService} from "../resources/kubernetes/Service";
import {createNamespace} from "../resources/kubernetes/namespace";
import {createDbSecret, createDirectusS3Secret, createGitlabSecret,} from "../resources/kubernetes/Secrets";
import * as env from "../util/env";
import createBackupCronjob from "../resources/kubernetes/CronJob";
import {basicAuthAnnotation} from "../util/globals";

export function createBjoern() {
  const namespaceBurban = createNamespace("burban")
  const namespaceBahrenberg = createNamespace("bahrenberg")
 let permRedirectAnnotation = {"traefik.ingress.kubernetes.io/redirect-permanent": "true"}
 let ws1 = new WebService("webcv-dev", "dev.burban.me", namespaceBurban, "registry.gitlab.com/privateprojectsbu/webcv", "v1.2.2-rc.2", basicAuthAnnotation, "dev");
 let ws2 = new WebService("webcv-prod", "burban.me", namespaceBurban, "registry.gitlab.com/privateprojectsbu/webcv", "v1.2.2", {}, "prod");
 let ws3 = new WebService("webcv-experimental", "experimental.burban.me", namespaceBurban, "registry.gitlab.com/privateprojectsbu/webcv", "feature-next", basicAuthAnnotation, "experimental");
 let ws4 = new WebService("website-dev", "dev.tischlerei-bahrenberg.de", namespaceBahrenberg, "registry.gitlab.com/a9668/bahrenberg/website", "v1.0.0-rc.9", basicAuthAnnotation, "dev");
 const gitlabSecretB = createGitlabSecret("pulumi", env.pullSecret, "gitlab-pull-secret", namespaceBurban);
 const gitlabSecretBa = createGitlabSecret("pulumi", env.pullSecret, "gitlab-pull-secret-bahrenberg", namespaceBahrenberg);
 const dbBackupSecret = createDbSecret(env.dbBackupUser, env.dbBackupPassword, "db-backup", namespaceBurban);
 const s3Secret = createDirectusS3Secret(env.s3UserKey, env.s3UserSecret, namespaceBurban);
 const cronjon = createBackupCronjob(namespaceBurban, dbBackupSecret, s3Secret)
 createDeployments(new Array<WebService>(ws1, ws2, ws3, ws4));
 createService(new Array<WebService>(ws1, ws2, ws3, ws4));
 createIngresses(new Array<WebService>(ws1, ws2, ws3, ws4));
}
//console.log(directus.ready);
