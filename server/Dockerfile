# Use the official Node.js image as the base image
FROM node:20.11.1-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install

# Copy the entire local project directory to the working directory
COPY . .

# Command to run the application
CMD ["npm", "run", "start"]