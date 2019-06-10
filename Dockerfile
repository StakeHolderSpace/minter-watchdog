# ---- Базовый Node ----
FROM node:11 AS base

WORKDIR /app

# ---- Зависимости ----
FROM base AS dependencies  

COPY package*.json ./

RUN npm install 

# ---- Скопировать файлы/билд ----
FROM dependencies AS build  

WORKDIR /app

COPY . /app


# --- Выпуск, используя Alpine ----
FROM node:11-alpine AS release  

WORKDIR /app

COPY --from=dependencies /app/package.json ./

RUN   npm install --only=production

COPY --from=build /app ./

#
CMD ["node", "-r","esm","index.js"]
