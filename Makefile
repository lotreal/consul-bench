.PHONY: get
get:
	curl -s http://127.0.0.1:8500/v1/catalog/services?node-meta=zbj_run_env:dev | python -m json.tool
	curl -s http://127.0.0.1:8500/v1/catalog/service/sahaba-api?node-meta=zbj_run_env:dev | python -m json.tool

.PHONY: list
list:
	curl -s http://127.0.0.1:8500/v1/catalog/services | python -m json.tool

.PHONY: register-service
register-service:
	curl -X PUT -d @w1 http://127.0.0.1:8500/v1/catalog/register
	curl -X PUT -d @w2 http://127.0.0.1:8500/v1/catalog/register
	curl -X PUT -d @w3 http://127.0.0.1:8500/v1/catalog/register

.PHONY: update-service
update-service:
	curl -X PUT -d @s3.1.service http://127.0.0.1:8500/v1/catalog/register

.PHONY: deregister-service
deregister-service:
	curl http://127.0.0.1:8500/v1/agent/service/deregister/web1
	curl -s http://127.0.0.1:8500/v1/catalog/service/web | python -m json.tool
