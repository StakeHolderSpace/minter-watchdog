# ---- Базовый Node ----
FROM node:11-alpine AS base

WORKDIR /app

# ---- Зависимости ----
FROM base AS dependencies

COPY package*.json ./

RUN apk add --no-cache --virtual .gyp \
        openssh-client \
        ca-certificates \
        git \
        python \
        make \
        g++ \
    &&  mkdir -p ~/.ssh \
    && ssh-keyscan github.com >> ~/.ssh/known_hosts \
    && npm install --unsafe-perm \
    && apk del .gyp

# ---- Скопировать файлы/билд ----
FROM dependencies AS build

COPY . /app

# --- Выпуск, используя Alpine ----
FROM node:11-alpine AS release

WORKDIR /app

#COPY --from=dependencies /app/package.json ./

COPY --from=build /app ./

RUN chown -R node:node /app

USER node

#RUN   npm install --only=production

#
CMD ["node", "-r","esm","index.js"]
