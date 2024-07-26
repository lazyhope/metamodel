# Build stage
FROM node:22.4.1 AS build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app

# For deploying frontend independently
ARG VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
