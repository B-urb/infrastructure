import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import {createDeployments} from "./src/WebDeployments";
import {WebService} from "./src/types/WebService";

let ws1 = new WebService("testdeployment","test.burban.me",);

createDeployments(new Array<WebService>(ws1));




