FROM mcr.microsoft.com/playwright:v1.45.1-jammy

RUN apt update && apt install -y curl unzip

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.21"

ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY . .

RUN bun install

CMD ["bun", "e2e", "test"]

