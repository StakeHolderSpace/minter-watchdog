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

cp ./.env.example ./.env

# Заполняем настройки в .env, затем:
sudo sh -c 'chown 1000:1000 ./.env && chmod 600 ./.env'

docker-compose up --build -d

docker system prune -f
```

