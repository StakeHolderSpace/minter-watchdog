### Установка и запуск
```
git clone 
cd minter-watchdog
npm install
cp ./config.js.example ./config.js

// Заполняем настройки в config.js, затем:

chmod 600 ./config.js

npm run start
```

### Docker

```
git clone
cd minter-watchdog
cp ./config.js.example ./config.js

// Заполняем настройки в config.js, затем:

chmod 600 ./config.js

docker-compose up -d --build

```

