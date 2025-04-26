# Build stage
FROM node:18 as build

WORKDIR /app
COPY frontend/package.json ./
RUN npm install
COPY frontend .

# Build the React app
RUN npm run build

# Serve the static files with nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
