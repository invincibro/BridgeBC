FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 3000

# Use nodemon for hot-reload in dev; swap for `node index.js` in production
CMD ["npx", "nodemon", "index.js"]
