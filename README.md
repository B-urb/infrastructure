# Infrastructure

## Description
I use this cluster to host all my personal stuff.
This project is a multi-layered infrastructure setup using Pulumi. It is divided into three main layers:

1. [l0](l0/): The base infrastructure like the Kubernetes cluster and DNS resources. It is implemented in TypeScript and uses various Pulumi libraries such as `@pulumi/kubernetes`, `@pulumi/hcloud`, and `@pulumi/github` among others. The main entry point is [index.ts](l0/index.ts). Currently it setups a k3s cluster on hetzner with the hetzner-csi driver using cilium

2. [l1](l1/): This layer is responsible for setting up the necessary configurations for the project. It exposes several outputs including the Postgres user, Postgres password, and Mailgun host. The main entry point is [configs.ts](l1/configs.ts).


3. [l2](l2/): Infrastructure like CMS and other high-level software that depends on databases. It is implemented in Node.js. The main entry point is (provide the main entry point for l2).

There is also a [flux-operator](flux-operator/) component. This is used for GitOps within the cluster

## Goals
- Provide a set of configurable infrastructure components according to each layer
- provide templates or starters for composing these components into an actual deployment on what you need
- refactor the code
- implement other cloud providers/databases/services etc.

## Installation

This project uses npm for package management. To install the dependencies, run the following command in each of the directories (l0, l1, l2, and flux-operator):

```sh
npm install
```

Usage
To use this project, you need to deploy each layer in order. Start with l0, then l1, and finally l2. For each layer, navigate to the directory and run the following command:

This will deploy the resources defined in that layer. Repeat the process for each layer.

```sh
pulumi up
```

## Contributing

Contributions are welcome, just note that the project is still Work in Progess and the final structure is not yet comlete