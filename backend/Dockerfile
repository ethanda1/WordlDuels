# Use the official Node.js image as the base
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app listens on (change if needed)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
