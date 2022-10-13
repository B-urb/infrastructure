import {core} from "@pulumi/kubernetes/types/input";
import {Namespace} from "@pulumi/kubernetes/core/v1";


export class WebService {
  name!: string;
  url!: string;
  registryImage: string | null;
  imageTag: string | null;
  keelAnnotations: object | null;
  ingressAnnotations: object | null;
  namespace!: Namespace

  constructor(name: string, url: string, namespace: Namespace, registryImage: string | null, imageTag: string| null, keelAnnotations: object|null, ingressAnnotations: object | null) {
    this.name = name;
    this.url = url;
    this.namespace = namespace
    this.registryImage = registryImage;
    this.imageTag = imageTag;
    this.keelAnnotations = keelAnnotations;
    this.ingressAnnotations = ingressAnnotations;

  }
}
