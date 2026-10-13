# syntax=docker/dockerfile:1

# `--ignore-scripts`: el postinstall (`prisma contract emit`) no hace falta, contract.json y contract.d.ts están versionados.
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

# También es el target del servicio `migrate` (necesita el CLI de prisma, que es devDependency).
FROM deps AS build
COPY . .
RUN yarn build

FROM node:24-slim AS prod-deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --ignore-scripts

FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/src/main"]
