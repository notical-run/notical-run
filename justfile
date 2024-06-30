up:
  docker compose up

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

client:
  bun app dev
