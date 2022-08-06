
import {createDeployments} from "./src/WebDeployments";
import {WebService} from "./src/types/WebService";
import {createIngresses} from "./src/Ingress";
import {createService} from "./src/Service";
import {createDirectus, createEtcd, createGitlabRunner} from "./src/Charts";
import createCronjob from "./src/CronJob";


let cronjob = createCronjob()
let ws1 = new WebService("webcv-dev","dev.burban.me", "registry.gitlab.com/privateprojectsbu/webcv", "development", "force");
let ws2 = new WebService("webcv-prod", "burban.me",  "registry.gitlab.com/privateprojectsbu/webcv", "v1.1.2", "major");

createDeployments(new Array<WebService>(ws1, ws2));
createService(new Array<WebService>(ws1, ws2));
createIngresses(new Array<WebService>(ws1, ws2));

let gitlabRunner = createGitlabRunner();
let directus = createDirectus();
let etcd = createEtcd();
//console.log(directus.ready);
