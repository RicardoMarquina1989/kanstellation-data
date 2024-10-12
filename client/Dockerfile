# Use the official Node.js runtime as the base image
FROM node:16.20.2-alpine as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use Nginx as the production server
FROM nginx:alpine

# Expose port 3000
EXPOSE 3000

# Copy nginx configuration to the docker container
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the built React app to Nginx's web server directory
COPY --from=builder /app/build /usr/share/nginx/html