# Makefile to build and start the bot

# Load environment variables from the .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

init-project:
	cp ./.env.dist ./.env

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

docker-build:
	docker build -t index-bot-image .

docker-run:
	docker run --env-file .env --rm index-bot

start-container:
	docker compose up -d

stop-container:
	docker compose stop

.PHONY: install build start clean run
