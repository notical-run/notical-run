FROM oven/bun:1.1

RUN apt-get update && apt-get install -y git curl

WORKDIR /app

COPY . .

RUN bun install

RUN bun api compile

CMD ["./apps/api/dist/api-bin"]
