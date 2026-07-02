FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/frontend/package*.json apps/frontend/
COPY packages/shared-types/package*.json packages/shared-types/
COPY packages/shared-utils/package*.json packages/shared-utils/
RUN npm ci
COPY . .
RUN npm run build --workspace @techcenter/frontend

FROM nginx:1.27-alpine AS runner
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
