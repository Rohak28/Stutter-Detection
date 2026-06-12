# Step 1: Use Node.js as the base image
FROM node:18-alpine AS build

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json first
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the app's source code
COPY . .

# Step 6: Build the production-ready app
RUN npm run build

# Step 7: Use Nginx to serve the built files
FROM nginx:alpine

# Step 8: Copy build output from Node container to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Step 9: Copy Nginx configuration for API proxy
COPY nginx.conf /etc/nginx/nginx.conf

# Step 10: Expose port 80 (Nginx default)
EXPOSE 80

# Step 11: Start Nginx
CMD ["nginx", "-g", "daemon off;"]
