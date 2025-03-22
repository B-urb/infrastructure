#!/usr/bin/env sh
# ../cloud-init/install-k3s.sh
PUBLIC_IP=$(curl -w "\n" http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)
curl -sfL https://get.k3s.io | sh -s - --bind-address ${PUBLIC_IP}