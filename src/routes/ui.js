'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config.json');
const defaultData = require('../data/default.js');
const map = require('../data/map.js');
//const subscriptions = require('../data/subscriptions.js');
const Raid = require('../models/raid.js');
const Quest = require('../models/quest.js');
const Invasion = require('../models/invasion.js');
const GeofenceService = require('../services/geofence.js');

const svc = new GeofenceService.GeofenceService();


router.get(['/', '/index'], async (req, res) => {
    res.render('index', defaultData);
});

if (config.discord.enabled) {
    router.get('/login', (req, res) => {
        res.redirect('/api/discord/login');
    });

    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) throw err;
            res.redirect('/login');
        });
    });
}

router.get('/subscriptions', async (req, res) => {
    const data = defaultData;
    res.render('subscriptions', data);
});


// Pokemon Routes
router.get('/pokemon', (req, res) => {
    const data = defaultData;
    res.render('pokemon', data);
});

router.get('/pokemon/new', (req, res) => {
    const data = defaultData;
    data.pokemon = map.getPokemonNameIdsList();
    let cities = [];
    for (let i = 0; i < svc.geofences.length; i++) {
        const geofence = svc.geofences[i];
        const configGuilds = config.discord.guilds;
        for (let j = 0; j < configGuilds.length; j++) {
            const guild = configGuilds[j];
            if (req.session.guilds.includes(guild.id) && guild.geofences.includes(geofence.name)) {
                cities.push({
                    'name': geofence.name,
                    'guild': guild.id
                });
            }
        }
    };
    data.cities = cities;
    res.render('pokemon-new', data);
});

router.get('/pokemon/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('pokemon-delete', data);
});


// Raid routes
router.get('/raids', (req, res) => {
    const data = defaultData;
    res.render('raids', data);
});

router.get('/raid/new', (req, res) => {
    const data = defaultData;
    data.pokemon = map.getPokemonNameIdsList();
    data.cities = buildCityList(req.session.guilds);
    res.render('raid-new', data);
});

router.get('/raid/edit/:id', async (req, res) => {
    const data = defaultData;
    const id = req.params.id;
    data.id = id;
    const raid = await Raid.getById(id);
    data.pokemon = map.getPokemonNameIdsList();
    data.pokemon.forEach(pkmn => {
        pkmn.selected = parseInt(pkmn.id) === raid.pokemonId;
    });
    data.cities = buildCityList(req.session.guilds);
    data.cities.forEach(city => {
        city.selected = city.name === raid.city;
    });
    res.render('raid-edit', data);
});

router.get('/raid/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('raid-delete', data);
});


// Quest routes
router.get('/quests', (req, res) => {
    const data = defaultData;
    res.render('quests', data);
});

router.get('/quest/new', (req, res) => {
    const data = defaultData;
    data.cities = buildCityList(req.session.guilds);
    res.render('quest-new', data);
});

router.get('/quest/edit/:id', async (req, res) => {
    const data = defaultData;
    const id = req.params.id;
    data.id = id;
    const quest = await Quest.getById(id);
    data.reward = quest.reward;
    data.cities = buildCityList(req.session.guilds);
    data.cities.forEach(city => {
        city.selected = city.name === quest.city;
    });
    res.render('quest-edit', data);
});

router.get('/quest/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('quest-delete', data);
});


// Invasion routes
router.get('/invasions', (req, res) => {
    const data = defaultData;
    res.render('invasions', data);
});

router.get('/invasion/new', (req, res) => {
    const data = defaultData;
    data.rewards = map.getGruntRewardIdsList();
    data.cities = buildCityList(req.session.guilds);
    res.render('invasion-new', data);
});

router.get('/invasion/edit/:id', async (req, res) => {
    const data = defaultData;
    const id = req.params.id;
    data.id = id;
    const invasion = await Invasion.getById(id);
    data.rewards = map.getGruntRewardIdsList();
    data.rewards.forEach(reward => {
        reward.selected = reward.pokemon_id === invasion.rewardPokemonId;
    });
    data.cities = buildCityList(req.session.guilds);
    data.cities.forEach(city => {
        city.selected = city.name === invasion.city;
    });
    res.render('invasion-edit', data);
});

router.get('/invasion/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('invasion-delete', data);
});

function buildCityList(guilds) {
    let cities = [];
    for (let i = 0; i < svc.geofences.length; i++) {
        const geofence = svc.geofences[i];
        const configGuilds = config.discord.guilds;
        for (let j = 0; j < configGuilds.length; j++) {
            const configGuild = configGuilds[j];
            if (guilds.includes(configGuild.id) && configGuild.geofences.includes(geofence.name)) {
                cities.push({
                    'name': geofence.name,
                    'guild': configGuild.id
                });
            }
        }
    }
    return cities;
}

module.exports = router;