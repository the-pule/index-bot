# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

RUN apk update

# Install PostgreSQL client (to interact with DB)
RUN apk add --no-cache postgresql-client

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Create necessary directories
RUN mkdir -p /app/logs /app/data

# Copy the bot's source code
COPY . .

# Expose no ports (since it's a bot, not a web server)
CMD ["npm", "start"]
