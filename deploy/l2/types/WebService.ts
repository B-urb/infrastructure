import {Namespace, } from "@pulumi/kubernetes/core/v1";
import {Stage} from "../../util/types";


export class WebService {
  name!: string;
  url!: string;
  registryImage: string | null;
  imageTag: string | null;
  ingressAnnotations: object | null;
  namespace!: Namespace
  stage!: Stage

  constructor(name: string,
              url: string, namespace: Namespace,
              registryImage: string | null, imageTag: string| null,
              ingressAnnotations: object | null, stage: Stage)
  {
    this.name = name;
    this.url = url;
    this.namespace = namespace;
    this.registryImage = registryImage;
    this.imageTag = imageTag;
    this.ingressAnnotations = ingressAnnotations;
    this.stage = stage;

  }
}
