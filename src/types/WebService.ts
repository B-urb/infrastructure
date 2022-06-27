

export class WebService {
  name!: string;
  url!: string;
  registryImage: string | null;
  imageTag: string | null;

  constructor(name: string, url: string, registryImage: string | null, imageTag: string| null) {
    this.name = name;
    this.url = url;
    this.registryImage = registryImage;
    this.imageTag = imageTag;
  }
}
