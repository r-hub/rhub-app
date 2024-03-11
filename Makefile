
.PHONY: build push deploy dev k8s

build:
	docker compose build

push:
	docker compose push

dev:
	sed 's|linux/amd64|linux/arm64|' < docker-compose.yml \
		> docker-compose-arm64.yml
	docker-compose -f docker-compose-arm64.yml build
	docker stack deploy \
		--resolve-image never \
	    --compose-file=docker-compose-arm64.yml \
	    --compose-file=docker-compose-dev.yml \
	    rhub2

dev-config:
	@sed 's|linux/amd64|linux/arm64|' < docker-compose.yml \
		> docker-compose-arm64.yml
	@docker stack config \
		--compose-file=docker-compose-arm64.yml \
		--compose-file=docker-compose-dev.yml

k8s:
	kompose convert -f docker-compose.yml -o k8s
	sed -i .bak '/type: Recreate/d' k8s/web-deployment.yaml
	sed -i .bak '/type: Recreate/d' k8s/db-deployment.yaml
	sed -i .bak 's/ReadWriteOnce/ReadWriteMany\n  storageClassName: azurefiles/' \
		k8s/uploads-persistentvolumeclaim.yaml
	rm k8s/*.bak
