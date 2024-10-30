# Use Node.js as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Install @subsquid/cli globally
RUN npm install -g @subsquid/cli

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate migrations and build the project
RUN sqd build
