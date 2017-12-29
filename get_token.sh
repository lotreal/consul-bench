#!/usr/bin/env bash
curl \
    --request PUT \
    --header "X-Consul-Token: b1bs33bj3t" \
    --data \
    '{
  "Name": "Agent Token",
  "Type": "client",
  "Rules": "node \"\" { policy = \"write\" } service \"\" { policy = \"read\" }"
}' \
    http://172.26.5.12:8500/v1/acl/create
