
import {createDeployments} from "./src/WebDeployments";
import {WebService} from "./src/types/WebService";
import {createIngresses} from "./src/Ingress";
import {createService} from "./src/Service";
import {createDirectus} from "./src/Charts";
import createCronjob from "./src/CronJob";
let cronjob = createCronjob()
let ws1 = new WebService("webcv-dev","dev.burban.me", "registry.gitlab.com/privateprojectsbu/webcv", "development");
let ws2 = new WebService("webcv-prod", "burban.me",  "registry.gitlab.com/privateprojectsbu/webcv", "master");
let directusIngress = new WebService("directus","cms.burban.me",null, null);

createDeployments(new Array<WebService>(ws1, ws2));
createService(new Array<WebService>(ws1, ws2));
createIngresses(new Array<WebService>(ws1, ws2));

let directus = createDirectus();
//console.log(directus.ready);
