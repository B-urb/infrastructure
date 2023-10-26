import {createDeployments} from "../resources/WebDeployments";
import {WebService} from "../../l2/types/WebService";
import {createIngresses} from "../resources/kubernetes/Ingress";
import {createService} from "../resources/kubernetes/Service";
import {createNamespace} from "../../l0/namespace";
import {
 createBackupSecret,
 createGitlabSecret,
} from "../resources/kubernetes/Secrets";
import * as env from "../../util/env";
import createBackupCronjob from "../../l2/CronJob";
import {basicAuthAnnotation} from "../../util/globals";

export function createBjoern() {
  const namespaceBurban = createNamespace("burban")
  const namespaceBahrenberg = createNamespace("bahrenberg")
 let permRedirectAnnotation = {"traefik.ingress.kubernetes.io/redirect-permanent": "true"}
 let ws1 = new WebService("webcv-dev", "dev.burban.me", namespaceBurban, "registry.gitlab.com/privateprojectsbu/webcv", "v2.4.0-rc.2", basicAuthAnnotation, "dev");
 let ws2 = new WebService("webcv-prod", "burban.me", namespaceBurban, "registry.gitlab.com/privateprojectsbu/webcv", "v2.4.0", {}, "prod");
 let ws3 = new WebService("webcv-experimental", "experimental.burban.me", namespaceBurban, "registry.gitlab.com/privateprojectsbu/webcv", "feature-next", basicAuthAnnotation, "experimental");
 let ws4 = new WebService("website-dev", "dev.tischlerei-bahrenberg.de", namespaceBahrenberg, "registry.gitlab.com/a9668/bahrenberg/website", "v1.0.0-rc.1", basicAuthAnnotation, "dev");
 let ws5 = new WebService("website-prod", "tischlerei-bahrenberg.de", namespaceBahrenberg, "registry.gitlab.com/a9668/bahrenberg/website", "v1.0.1", {}, "prod");

 const gitlabSecretB = createGitlabSecret("pulumi", env.pullSecret, "gitlab-pull-secret", namespaceBurban);
 const gitlabSecretBa = createGitlabSecret("pulumi", env.pullSecret, "gitlab-pull-secret-bahrenberg", namespaceBahrenberg);

 const dbBackupSecret = createBackupSecret(namespaceBurban);

 const cronjob = createBackupCronjob(namespaceBurban, dbBackupSecret)
 createDeployments(new Array<WebService>(ws1, ws2, ws3, ws4, ws5));
 createService(new Array<WebService>(ws1, ws2, ws3, ws4, ws5));
 createIngresses(new Array<WebService>(ws1, ws2, ws3, ws4, ws5));
}
//console.log(directus.ready);
