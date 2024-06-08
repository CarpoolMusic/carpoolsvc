# Use an official Node runtime as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /workspaces

# Install TypeScript globally
RUN npm install -g ts-node typescript tsconfig-paths

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install application dependencies
RUN npm install

# Bundle app source by copying all source files
COPY . .

# Build TypeScript to JavaScript
RUN tsc

# Expose port (you can use any port you like)
EXPOSE 3000

RUN npm run build

# Run the application
CMD ["npm", "start"]
