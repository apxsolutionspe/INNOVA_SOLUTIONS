FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/
COPY packages/shared-types/package*.json packages/shared-types/
COPY packages/shared-utils/package*.json packages/shared-utils/
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run prisma:generate
RUN npm run build --workspace @techcenter/backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S innova && adduser -S innova -G innova
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
USER innova
EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
