FROM oven/bun:1.1.21

RUN apt update && apt install -y git curl

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

RUN bun api compile

CMD ["./apps/api/dist/api-bin"]
