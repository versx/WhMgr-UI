![Node.js CI](https://github.com/versx/WhMgr-UI/workflows/Node.js%20CI/badge.svg)  
# Webhook Manager User Interface  

## Installation  
1.) Clone repository `git clone https://github.com/versx/WhMgr-UI`  
2.) Install dependencies `npm install`  
3.) Copy config `cp src/config.example.json src/config.json`  
4.) Create a Discord bot at https://discord.com/developers and enter the `botToken`, `clientId`, and `clientSecret` in your `config.json`  
5.) Fill out config `vi src/config.json`  
6.) Create or copy your existing geofences to the `geofences` folder. One geofence per file, the following is the expected format:  
```ini
[City Name]
0,0
1,1
2,2
3,3
```
7.) Run `npm start`  
8.) Access via http://machineip:port/ login using your Discord account    

## Updating  
1.) `git pull`  
2.) Run `npm install` in root folder  
3.) Run `npm start`  

## Notes  
If you want to host your images locally where WhMgr-UI resides, change your `pokemon` and `eggs` image urls to something like the following:  
Pokemon Id is always 3 digits i.e `007`, `047`, `147` although form will be whatever the form number is i.e `12`, `195`, `4032` etc  
```
"images": {
    "pokemon": "../img/pokemon/pokemon_icon_%s_%s.png",
    "eggs": "../img/eggs/%s.png"
},
```

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
