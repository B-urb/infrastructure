import {Namespace, Secret} from "@pulumi/kubernetes/core/v1";


export class WebService {
  name!: string;
  url!: string;
  registryImage: string | null;
  imageTag: string | null;
  keelAnnotations: object | null;
  ingressAnnotations: object | null;
  namespace!: Namespace
  gitlabSecret!: Secret

  constructor(name: string,
              url: string, namespace: Namespace,
              registryImage: string | null, imageTag: string| null,
              gitlabSecret: Secret,
              keelAnnotations: object|null,
              ingressAnnotations: object | null,)
  {
    this.name = name;
    this.url = url;
    this.namespace = namespace;
    this.gitlabSecret = gitlabSecret;
    this.registryImage = registryImage;
    this.imageTag = imageTag;
    this.keelAnnotations = keelAnnotations;
    this.ingressAnnotations = ingressAnnotations;

  }
}
