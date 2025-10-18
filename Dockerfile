# ✅ Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all backend files
COPY . .

# Expose backend port
EXPOSE 4000

# Start backend
CMD ["npm", "start"]
