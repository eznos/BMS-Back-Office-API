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

db-up:
	@npx sequelize-cli db:migrate

db-down:
	@npx sequelize-cli db:migrate:undo

gen-config-dev:
	@ln -sfn .env.dev .env

run-dev:
	@npm run dev

check-lint:
	@npm run lint

re-format:
	@npm run format
