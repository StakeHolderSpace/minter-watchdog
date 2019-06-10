### 
```
git clone https://github.com/StakeHolderSpace/minter-watchdog.git

cd minter-watchdog

npm install

cp ./config.js.example ./config.js

# Заполняем настройки в config.js, затем:

chmod 600 ./config.js

npm run start
```

### Docker

```
git clone https://github.com/StakeHolderSpace/minter-watchdog.git

cd minter-watchdog

cp ./config.js.example ./config.js

# Заполняем настройки в config.js, затем:

chmod 600 ./config.js

docker-compose build && docker system prune -f

docker-compose up -d

```

