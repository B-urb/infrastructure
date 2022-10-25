import {createDeployments} from "../resources/WebDeployments";
import {WebService} from "../types/WebService";
import {createIngresses} from "../resources/kubernetes/Ingress";
import {createService} from "../resources/kubernetes/Service";
import {createDirectus, createEtcd, createGitlabRunner} from "../resources/charts/Charts";
import createCronjob from "../resources/kubernetes/CronJob";
import {namespaceBahrenberg, namespaceBurban} from "../resources/kubernetes/namespace";
import {bahrenbergGitlab, gitlabSecret} from "../resources/kubernetes/Secrets";

let cronjob = createCronjob()
let keelAnnotationsExp = {"keel.sh/policy": "all"}
let keelAnnotationsDev = {"keel.sh/match-tag": "true", "keel.sh/policy": "all"}
let keelAnnotationsProd = {"keel.sh/policy": "major"}

let basicAuthAnnotation = {"traefik.ingress.kubernetes.io/router.middlewares": "kube-system-basic-auth@kubernetescrd"};
let basicAuth2Annotation = {
  "ingress.kubernetes.io/auth-type": "basic",
  "ingress.kubernetes.io/auth-secret": "basic-auth"
}
let permRedirectAnnotation = {"traefik.ingress.kubernetes.io/redirect-permanent": "true"}
let ws1 = new WebService("webcv-dev", "dev.burban.me", namespaceBurban, "registry.gitlab.com/privateprojectsbu/webcv", "v1.2.2-rc.2", gitlabSecret, keelAnnotationsDev, basicAuthAnnotation);
let ws2 = new WebService("webcv-prod", "burban.me", namespaceBurban, "registry.gitlab.com/privateprojectsbu/webcv", "v1.1.2", gitlabSecret, keelAnnotationsProd, {});
let ws3 = new WebService("webcv-experimental", "experimental.burban.me", namespaceBurban, "registry.gitlab.com/privateprojectsbu/webcv", "feature-next", gitlabSecret, keelAnnotationsExp, basicAuthAnnotation);
let ws4 = new WebService("website-dev", "dev.tischlerei-bahrenberg.de", namespaceBahrenberg, "registry.gitlab.com/a9668/bahrenberg/website", "v1.0.0-rc.1", bahrenbergGitlab, keelAnnotationsDev, basicAuthAnnotation);


createDeployments(new Array<WebService>(ws1, ws2, ws3, ws4));
createService(new Array<WebService>(ws1, ws2, ws3, ws4));
createIngresses(new Array<WebService>(ws1, ws2, ws3, ws4));

let gitlabRunner = createGitlabRunner();
let directus = createDirectus();
let etcd = createEtcd();
//console.log(directus.ready);
