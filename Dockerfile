FROM oven/bun:1.0.36-slim

WORKDIR /app
COPY package.json package.json
RUN bun install

COPY . .
RUN bun --bun run build

EXPOSE 3000
ENV ORIGIN="http://0.0.0.0:3000"
ENTRYPOINT ["sh", "./start.sh"]
