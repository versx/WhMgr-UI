![Node.js CI](https://github.com/versx/WhMgr-UI/workflows/Node.js%20CI/badge.svg)
![Lint](https://github.com/versx/MapJS/workflows/Lint/badge.svg)  

[![GitHub Release](https://img.shields.io/github/release/versx/WhMgr-UI.svg)](https://github.com/versx/WhMgr-UI/releases/)
[![GitHub Contributors](https://img.shields.io/github/contributors/versx/WhMgr-UI.svg)](https://github.com/versx/WhMgr-UI/graphs/contributors/)
[![Discord](https://img.shields.io/discord/552003258000998401.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/zZ9h9Xa)  
# Webhook Manager User Interface  

## Installation  
1. Clone repository `git clone https://github.com/versx/WhMgr-UI`  
1. Install dependencies `npm install`  
1. Copy config `cp src/config.example.json src/config.json`  
1. Create a Discord bot at https://discord.com/developers and enter the `botToken`, `clientId`, and `clientSecret` in your `config.json`  
1. Fill out config `vi src/config.json`  
1.) Run `npm start`  
1.) Access via http://machineip:port/ login using your Discord account    

## Updating  
1. Run `git pull`  
1. Run `npm run update`  

## PM2 (recommended)  
Once everything is setup and running appropriately, you can add this to PM2 ecosystem.config.js file so it is automatically started:  
```
module.exports = {
  apps : [
  {
    name: 'WhMgr-UI',
    script: 'index.js',
    cwd: '/home/username/WhMgr-UI/src/',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    out_file: 'NULL'
  }
  ]
};
```

## Previews
![Main Page](/previews/main.png)  
![Pokemon Page](/previews/pokemon.png)  
![Add Pokemon Page](/previews/pokemon_add.png)  
