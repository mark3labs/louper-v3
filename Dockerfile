FROM oven/bun:1.1.20-slim

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Build the application
RUN bun run build

EXPOSE 3000
ENV ORIGIN="http://0.0.0.0:3000"
ENV NODE_ENV="production"
ENTRYPOINT ["sh", "./start.sh"]
