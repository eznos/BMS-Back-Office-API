install-package-dev:
	@npm install

start-db:
	@docker compose \
	-f docker-compose.db.yml \
	up -d

stop-db:
	@docker compose \
	-f docker-compose.db.yml \
	down

gen-config-dev:
	@ln -sfn .env.dev .env

run-dev:
	@npm run dev
