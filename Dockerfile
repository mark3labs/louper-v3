FROM oven/bun:1.4.2-slim

# Build argument to determine if this is production
ARG BUILD_ENV=development

WORKDIR /app

# Copy package files
# NOTE: this project uses bun's text lockfile (bun.lock), not the legacy
# binary bun.lockb. Copying it explicitly keeps installs reproducible.
COPY package.json bun.lock ./

# Install dependencies (devDependencies are required to run the SvelteKit build)
RUN bun install --frozen-lockfile

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
