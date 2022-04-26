import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import {createDeployments} from "./types/WebDeployments";
import {WebService} from "./types/WebService";

let ws1 = new WebService("testdeployment","test.burban.me",);

createDeployments(new Array<WebService>(ws1));



const appLabels = { app: "nginx" };
const deployment = new k8s.apps.v1.Deployment("nginx", {
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: "nginx", image: "nginx" }] }
        }
    }
});
export const name = deployment.metadata.name;
