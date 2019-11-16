# Version of node
FROM node:alpine

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# Install nodemon globally
RUN npm install -g nodemon

# Install dependencies
RUN npm install
