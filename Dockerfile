# Version of node
FROM node:alpine

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# Install dependencies
RUN npm install
