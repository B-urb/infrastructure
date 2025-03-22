package postgres

import (
	helmv4 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/helm/v4"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func createPostgres() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := helmv4.NewChart(ctx, "nginx", &helmv4.ChartArgs{
			Chart: pulumi.String("nginx"),
			RepositoryOpts: &helmv4.RepositoryOptsArgs{
				Repo: pulumi.String("https://charts.bitnami.com/bitnami"),
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
