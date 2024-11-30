FROM node:20-alpine AS base
RUN npm install --global pnpm
WORKDIR /app
EXPOSE 8080

FROM base AS develop
CMD pnpm start:develop

FROM base AS builder
COPY node_modules node_modules
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY prisma prisma
COPY src src
RUN pnpm build

FROM base AS production
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY prisma prisma
COPY --from=builder /app/dist dist
RUN pnpm install --production --ignore-scripts
CMD pnpm prisma:deploy && pnpm start:production
