
.PHONY: build push deploy dev k8s

build:
	docker compose build

push:
	docker compose push

docker-compose-local.yml: docker-compose.yml
	if [[ "`docker info -f '{{ .Architecture }}'`" == "aarch64" ]]; then \
		sed 's|linux/amd64|linux/arm64|' < docker-compose.yml \
			> docker-compose-local.yml; \
	else \
		cp docker-compose.yml docker-compose-local.yml; \
	fi

dev: docker-compose-local.yml
	docker-compose -f docker-compose-local.yml build
	docker stack deploy \
		--resolve-image never \
	    --compose-file=docker-compose-local.yml \
	    --compose-file=docker-compose-dev.yml \
	    rhub2

k8s:
	kompose convert -f docker-compose.yml -o k8s
	sed -i .bak '/type: Recreate/d' k8s/web-deployment.yaml
	sed -i .bak 's/ReadWriteOnce/ReadWriteMany\n  storageClassName: azurefiles/' \
		k8s/uploads-persistentvolumeclaim.yaml
	rm k8s/*.bak
