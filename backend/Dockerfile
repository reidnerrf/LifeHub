FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install --no-audit --no-fund

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]

