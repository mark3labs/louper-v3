FROM oven/bun:1.3.0-slim

# Build argument to determine if this is production
ARG BUILD_ENV=development

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Set build environment variable for SvelteKit build
ENV PUBLIC_BUILD_ENV=$BUILD_ENV

# Build the application
RUN bun run build

EXPOSE 3000
ENV ORIGIN="http://0.0.0.0:3000"
ENV NODE_ENV="production"
ENTRYPOINT ["sh", "./start.sh"]
