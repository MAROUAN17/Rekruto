all:
	docker compose up -d
up:
	docker compose up -d

build:
	docker compose build --no-cache
	docker compose up -d

down:
	docker compose down

fclean:
	@docker stop $$(docker ps -qa) 2>/dev/null; \
	docker rm $$(docker ps -qa) 2>/dev/null; \
	docker rmi -f $$(docker images -qa) 2>/dev/null; \
	docker network rm $$(docker network ls -q) 2>/dev/null || true;

clean:
	@docker stop $$(docker ps -qa) 2>/dev/null; \
	docker rm $$(docker ps -qa) 2>/dev/null; \
	docker rmi -f $$(docker images -qa) 2>/dev/null; \
	docker volume rm $$(docker volume ls -q) 2>/dev/null; \
	docker network rm $$(docker network ls -q) 2>/dev/null || true; \

re: fclean all
