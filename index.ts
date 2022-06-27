
import {createDeployments} from "./src/WebDeployments";
import {WebService} from "./src/types/WebService";
import {createIngresses} from "./src/Ingress";
import {createService} from "./src/Service";
import {createDirectus} from "./src/Charts";

let ws1 = new WebService("webcv-dev","dev.burban.me", "registry.gitlab.com/privateprojectsbu/webcv", "development");
let ws2 = new WebService("devdeployment", "dev.burban.me",  "registry.gitlab.com/privateprojectsbu/webcv", "latest");
let directusIngress = new WebService("directus","cms.burban.me",null, null);

createDeployments(new Array<WebService>(ws1));
createService(new Array<WebService>(ws1));
createIngresses(new Array<WebService>(ws1));

let directus = createDirectus();
//console.log(directus.ready);
