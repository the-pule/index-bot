# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Create logs directory (ensure it's writable)
RUN mkdir -p /app/logs

# Copy the bot's source code
COPY . .

# Expose no ports (since it's a bot, not a web server)
CMD ["npm", "start"]
