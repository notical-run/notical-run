up *args:
  docker compose --profile development up --exit-code-from api-test {{args}}

test *args:
  docker compose --profile test up --exit-code-from api-test {{args}}
  docker compose down

down:
  docker compose down

exec *args:
  docker compose exec -w /app/apps/api api {{args}}

shell *args: (exec "bash" args)
db-generate *args: (exec "bun" "db:generate" "--name" args)
db-migrate *args: (exec "bun" "db:migrate" args)
db-drop *args: (exec "bun" "db:drop" args)
db-reset *args: (exec "bun" "db:reset" args)
db-seed: (exec "bun" "run" "./seeds/dev.ts")

db-shell:
  psql 'postgres://postgres:postgres@localhost:5432/notical-run'

api-restart:
  docker compose restart api

client *args:
  bun app dev {{args}}
