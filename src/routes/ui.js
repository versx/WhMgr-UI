'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config.json');
const defaultData = require('../data/default.js');
const map = require('../data/map.js');
const Pokemon = require('../models/pokemon.js');
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


// Pokemon routes
router.get('/pokemon', (req, res) => {
    const data = defaultData;
    res.render('pokemon', data);
});

router.get('/pokemon/new', (req, res) => {
    const data = defaultData;
    data.pokemon = map.getPokemonNameIdsList();
    data.cities = buildCityList(req.session.guilds);
    res.render('pokemon-new', data);
});

router.get('/pokemon/edit/:id', async (req, res) => {
    const data = defaultData;
    const id = req.params.id;
    data.id = id;
    const pokemon = await Pokemon.getById(id);
    data.pokemon = map.getPokemonNameIdsList();
    data.pokemon.forEach(pkmn => {
        pkmn.selected = parseInt(pkmn.id) === pokemon.pokemonId;
    });
    data.iv = pokemon.minIV;
    data.iv_list = ['10/10/10\n0/15/15'];
    //data.lvl = `${pokemon.min_lvl}-${pokemon.max_lvl}`;
    data.min_lvl = pokemon.minLvl;
    data.max_lvl = pokemon.maxLvl;
    data.genders.forEach(gender => {
        data.selected = gender.id === pokemon.gender;
    });
    data.cities = buildCityList(req.session.guilds);
    /*
    data.cities.forEach(city => {
        city.selected = city.name === pokemon.city;
    });
    */
    res.render('pokemon-edit', data);
});

router.get('/pokemon/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('pokemon-delete', data);
});

router.get('/pokemon/delete_all', (req, res) => {
    const data = defaultData;
    res.render('pokemon-delete-all', data);
});


// PVP routes
router.get('/pvp/new', (req, res) => {
    const data = defaultData;
    data.pokemon = map.getPokemonNameIdsList();
    data.cities = buildCityList(req.session.guilds);
    res.render('pvp-new', data);
});

router.get('/pvp/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('pvp-delete', data);
});

router.get('/pvp/delete_all', (req, res) => {
    const data = defaultData;
    res.render('pvp-delete-all', data);
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

router.get('/raids/delete_all', (req, res) => {
    const data = defaultData;
    res.render('raids-delete-all', data);
});


// Gym routes
router.get('/gym/new', (req, res) => {
    const data = defaultData;
    //data.cities = buildCityList(req.session.guilds);
    res.render('gym-new', data);
});

router.get('/gym/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('gym-delete', data);
});

router.get('/gyms/delete_all', (req, res) => {
    const data = defaultData;
    res.render('gyms-delete-all', data);
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

router.get('/quests/delete_all', (req, res) => {
    const data = defaultData;
    res.render('quests-delete-all', data);
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

router.get('/invasions/delete_all', (req, res) => {
    const data = defaultData;
    res.render('invasions-delete-all', data);
});


router.get('/settings', (req, res) => {
    const data = defaultData;
    res.render('settings', data);
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