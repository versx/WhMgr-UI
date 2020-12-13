'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config.json');
const defaultData = require('../data/default.js');
const map = require('../data/map.js');
const Pokemon = require('../models/pokemon.js');
const PVP = require('../models/pvp.js');
const Raid = require('../models/raid.js');
const Quest = require('../models/quest.js');
const Invasion = require('../models/invasion.js');
const utils = require('../services/utils.js');


router.get(['/', '/index'], async (req, res) => {
    const data = { ...defaultData };
    data.user_id = req.session.user_id;
    data.servers = validateRoles(req, res);
    res.render('index', data);
});

router.get('/login', (req, res) => {
    res.redirect('/api/discord/login');
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            throw err;
        }
        res.redirect('/login');
    });
});


// Pokemon routes
router.get('/pokemon', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('pokemon', data);
});

router.get('/pokemon/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.pokemon = await map.getPokemonNameIdsList();
    data.cities = map.buildCityList(req.session.guilds);
    res.render('pokemon-new', data);
});

router.get('/pokemon/edit/:id', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const id = req.params.id;
    data.id = id;
    const pokemon = await Pokemon.getById(id);
    data.pokemon = await map.getPokemonNameIdsList();
    data.pokemon.forEach(pkmn => {
        pkmn.selected = parseInt(pkmn.id) === pokemon.pokemonId;
    });
    data.form = pokemon.form;
    data.iv = pokemon.minIv;
    data.iv_list = (pokemon.ivList || []).join('\n');
    data.min_lvl = pokemon.minLvl;
    data.max_lvl = pokemon.maxLvl;
    data.genders.forEach(gender => {
        data.selected = gender.id === pokemon.gender;
    });
    data.cities = map.buildCityList(req.session.guilds);
    const areas = pokemon.city.map(x => x.toLowerCase());
    data.cities.forEach(city => {
        city.selected = areas.includes(city.name.toLowerCase());
    });
    res.render('pokemon-edit', data);
});

router.get('/pokemon/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('pokemon-delete', data);
});

router.get('/pokemon/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('pokemon-delete-all', data);
});


// PVP routes
router.get('/pvp/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.pokemon = await map.getPokemonNameIdsList();
    data.cities = map.buildCityList(req.session.guilds);
    res.render('pvp-new', data);
});

router.get('/pvp/edit/:id', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const id = req.params.id;
    data.id = id;
    const pvp = await PVP.getById(id);
    data.pokemon = await map.getPokemonNameIdsList();
    data.pokemon.forEach(pkmn => {
        pkmn.selected = parseInt(pkmn.id) === pvp.pokemonId;
    });
    data.form = pvp.form;
    data.leagues.forEach(league => {
        league.selected = league.name === pvp.league;
    });
    data.min_rank = pvp.minRank;
    data.min_percent = pvp.minPercent;
    data.cities = map.buildCityList(req.session.guilds);
    const areas = pvp.city.map(x => x.toLowerCase());
    data.cities.forEach(city => {
        city.selected = areas.includes(city.name.toLowerCase());
    });
    res.render('pvp-edit', data);
});

router.get('/pvp/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('pvp-delete', data);
});

router.get('/pvp/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('pvp-delete-all', data);
});


// Raid routes
router.get('/raids', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('raids', data);
});

router.get('/raid/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.pokemon = await map.getPokemonNameIdsList();
    data.cities = map.buildCityList(req.session.guilds);
    res.render('raid-new', data);
});

router.get('/raid/edit/:id', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const id = req.params.id;
    data.id = id;
    const raid = await Raid.getById(id);
    data.pokemon = await map.getPokemonNameIdsList();
    data.pokemon.forEach(pkmn => {
        pkmn.selected = parseInt(pkmn.id) === raid.pokemonId;
    });
    data.form = raid.form;
    data.cities = map.buildCityList(req.session.guilds);
    const areas = raid.city.map(x => x.toLowerCase());
    data.cities.forEach(city => {
        city.selected = areas.includes(city.name.toLowerCase());
    });
    res.render('raid-edit', data);
});

router.get('/raid/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('raid-delete', data);
});

router.get('/raids/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('raids-delete-all', data);
});


// Gym routes
router.get('/gym/new', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('gym-new', data);
});

router.get('/gym/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('gym-delete', data);
});

router.get('/gyms/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('gyms-delete-all', data);
});


// Quest routes
router.get('/quests', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('quests', data);
});

router.get('/quest/new', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.cities = map.buildCityList(req.session.guilds);
    res.render('quest-new', data);
});

router.get('/quest/edit/:id', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const id = req.params.id;
    data.id = id;
    const quest = await Quest.getById(id);
    data.reward = quest.reward;
    data.cities = map.buildCityList(req.session.guilds);
    const areas = quest.city.map(x => x.toLowerCase());
    data.cities.forEach(city => {
        city.selected = areas.includes(city.name.toLowerCase());
    });
    res.render('quest-edit', data);
});

router.get('/quest/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('quest-delete', data);
});

router.get('/quests/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('quests-delete-all', data);
});


// Invasion routes
router.get('/invasions', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('invasions', data);
});

router.get('/invasion/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.rewards = await map.getPokemonNameIdsList();
    data.cities = map.buildCityList(req.session.guilds);
    res.render('invasion-new', data);
});

router.get('/invasion/edit/:id', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const id = req.params.id;
    data.id = id;
    const invasion = await Invasion.getById(id);
    data.rewards = await map.getPokemonNameIdsList();
    data.rewards.forEach(reward => {
        reward.selected = reward.id === invasion.rewardPokemonId;
    });
    data.cities = map.buildCityList(req.session.guilds);
    const areas = invasion.city.map(x => x.toLowerCase());
    data.cities.forEach(city => {
        city.selected = areas.includes(city.name.toLowerCase());
    });
    res.render('invasion-edit', data);
});

router.get('/invasion/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('invasion-delete', data);
});

router.get('/invasions/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('invasions-delete-all', data);
});


// Role assignment/unassignment routes
router.get('/roles', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('roles', data);
});

router.get('/role/add', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.cities = map.buildCityList(req.session.guilds);
    res.render('role-add', data);
});

router.get('/role/remove/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('role-remove', data);
});

router.get('/roles/remove_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('roles-remove-all', data);
})


// Settings routes
router.get('/settings', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('settings', data);
});

const validateRoles = (req, res) => {
    const servers = defaultData.servers;
    const guilds = req.session.guilds;
    const roles = req.session.roles;
    let valid = false;
    for (let server of servers) {
        if (roles[server.id]) {
            const userRoles = roles[server.id];
            const requiredRoles = config.discord.guilds.filter(x => x.id === server.id);
            if (requiredRoles.length > 0) {
                server.show = guilds.includes(server.id) && utils.hasRole(userRoles, requiredRoles[0].roles);
                if (server.show) {
                    valid = true;
                }
            } else {
                server.show = false;
            }
        } else {
            server.show = false;
        }
    }
    if (!valid) {
        console.error('Access not granted...');
        res.redirect('/login');
        return null;
    }
    return servers;
};

module.exports = router;