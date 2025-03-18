# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install SQLite
RUN apk add --no-cache sqlite

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Create logs directory (ensure it's writable)
RUN mkdir -p /app/logs

# Ensure data directory exists
RUN mkdir -p /app/data

# Copy the bot's source code
COPY . .

# Expose no ports (since it's a bot, not a web server)
CMD ["npm", "start"]
