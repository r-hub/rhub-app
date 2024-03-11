
.PHONY: build push deploy dev k8s

build:
	docker compose build

push:
	docker compose push

deploy:
	docker stack deploy \
	        --compose-file=docker-compose.yml rhub2

dev:
	docker stack deploy \
	        --compose-file=docker-compose.yml \
	        --compose-file=docker-compose-dev.yml \
	        rhub2

dev-config:
	@docker stack config \
		--compose-file=docker-compose.yml \
		--compose-file=docker-compose-dev.yml

k8s:
	kompose convert -f docker-compose.yml -o k8s
	sed -i .bak '/type: Recreate/d' k8s/web-deployment.yaml
	sed -i .bak '/type: Recreate/d' k8s/db-deployment.yaml
	rm k8s/*.bak
