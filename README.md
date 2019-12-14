### 
```
git clone https://github.com/StakeHolderSpace/minter-watchdog.git

cd minter-watchdog

npm install

cp ./.env.example ./.env

# Заполняем настройки в .env, затем:

chmod 600 ./.env

npm run start
```

### Docker

```
git clone https://github.com/StakeHolderSpace/minter-watchdog.git

cd minter-watchdog

docker-compose build && docker system prune -f

cp ./.env.example ./.env

# Заполняем настройки в .env, затем:

chmod 600 ./.env


docker-compose up -d

```

