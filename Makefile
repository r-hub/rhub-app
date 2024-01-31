.PHONY: build push deploy dev

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
