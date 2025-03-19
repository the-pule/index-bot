# Makefile to build and start the bot

# Load environment variables from the .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

init-project:
	cp ./.env.dist ./.env
	cp ./docker-compose.yml.dist ./docker-compose.yml

# Install dependencies
install:
	npm install

# Build the TypeScript files
build:
	mkdir -p $(BUILD_DIR)
	npx tsc

# Start the bot by running the compiled JavaScript file
start: build
	node $(JS_OUT)

# Clean the dist folder (compiled files)
clean:
	rm -rf $(BUILD_DIR)

# Run the whole process: install, build, and start the bot
run:
	build
	start

# Docker Commands

# Build Docker image for the bot
docker-build:
	docker compose build

# Run the bot container (only)
docker-run:
	docker compose run --env-file .env --rm bot

# Start the containers using Docker Compose (bot and database)
start-container:
	docker compose up -d

# Stop the containers using Docker Compose
stop-container:
	docker compose stop

# Remove containers and volumes (for a fresh start)
remove-container:
	docker compose down --volumes

# Stop, remove, rebuild, and restart the containers
docker-rebuild:
	docker compose down --volumes
	rm -rf $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)
	npx tsc
	docker compose build
	docker compose up -d

local-rebuild:
	# Stop and remove the existing container, including volumes
	docker stop index-bot-container || true
	docker rm index-bot-container || true
	docker volume prune -f  # Clean up any unused volumes

	# Clean up the build folder and create it again
	rm -rf $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)

	# Compile TypeScript files
	npx tsc
	docker network create bot-network || true  # Create the network if not exists

	# Build the Docker image using the host network
	docker build --network=host -t index-bot-image .

	# Run the db container (PostgreSQL)
	docker run --name index-bot-db --network bot-network -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -e POSTGRES_DB=${POSTGRES_DB} -v pg-data:/var/lib/postgresql/data -p 5432:5432 -d postgres:15

	# Run the bot container, linking to the PostgreSQL database
	docker run --env-file .env -v ./logs:/app/logs -v ./data:/app/data --network bot-network --name index-bot-container -d index-bot-image

# Ensure the bot and database are running properly
.PHONY: install build start clean run docker-build docker-run start-container stop-container remove-container docker-rebuild
