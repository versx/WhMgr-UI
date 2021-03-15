'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config.json');
const defaultData = require('../data/default.js');
const map = require('../data/map.js');
const Pokemon = require('../models/pokemon.js');
const PVP = require('../models/pvp.js');
const Raid = require('../models/raid.js');
const Gym = require('../models/gym.js');
const Quest = require('../models/quest.js');
const Invasion = require('../models/invasion.js');
const Lure = require('../models/lure.js');
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
    if (!pokemon) {
        res.redirect('/pokemon');
        return;
    }
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
    const areas = pokemon.city.map(x => x.toLowerCase());
    data.cities = getSelectedAreas(
        // Current guild
        pokemon.guildId,
        // Currently subscribed areas list
        areas,
        // All areas list
        map.buildCityList(req.session.guilds)
    );
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
    if (!pvp) {
        res.redirect('/pokemon#pvp');
        return;
    }
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
    data.cities = getSelectedAreas(
        // Current guild
        pvp.guildId,
        // Currently subscribed areas list
        pvp.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
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
    if (!raid) {
        res.redirect('/raids');
        return;
    }
    data.pokemon = await map.getPokemonNameIdsList();
    data.pokemon.forEach(pkmn => {
        pkmn.selected = parseInt(pkmn.id) === raid.pokemonId;
    });
    data.form = raid.form;
    data.cities = getSelectedAreas(
        // Current guild
        raid.guildId,
        // Currently subscribed areas list
        raid.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
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
router.get('/gym/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.pokemon = await map.getPokemonNameIdsList();
    res.render('gym-new', data);
});

router.get('/gym/edit/:id', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const id = req.params.id;
    data.id = id;
    const gym = await Gym.getById(id);
    if (!gym) {
        res.redirect('/raids#gyms');
        return;
    }
    data.pokemon = await map.getPokemonNameIdsList();
    data.pokemon.forEach(pkmn => {
        pkmn.selected = gym.pokemonIds.includes(pkmn.id.toString());
    });
    data.name = gym.name;
    data.min_level = gym.minLevel;
    data.max_level = gym.maxLevel;
    res.render('gym-edit', data);
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

router.get('/quest/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.rewards = await map.getQuestRewards();
    data.cities = map.buildCityList(req.session.guilds);
    res.render('quest-new', data);
});

router.get('/quest/edit/:id', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const id = req.params.id;
    data.id = id;
    const quest = await Quest.getById(id);
    if (!quest) {
        res.redirect('/quests');
        return;
    }
    data.reward = quest.reward;
    data.cities = getSelectedAreas(
        // Current guild
        quest.guildId,
        // Currently subscribed areas list
        quest.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
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
    if (!invasion) {
        res.redirect('/invasions');
        return;
    }
    data.rewards = await map.getPokemonNameIdsList();
    data.rewards.forEach(reward => {
        reward.selected = reward.id === invasion.rewardPokemonId;
    });
    data.cities = getSelectedAreas(
        // Current guild
        invasion.guildId,
        // Currently subscribed areas list
        invasion.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
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


// Lure routes
router.get('/lures', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('lures', data);
});

router.get('/lure/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.lureTypes = map.getLureTypes();
    data.cities = map.buildCityList(req.session.guilds);
    res.render('lure-new', data);
});

router.get('/lure/edit/:id', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const id = req.params.id;
    data.id = id;
    const lure = await Lure.getById(id);
    if (!lure) {
        res.redirect('/lures');
        return;
    }
    data.lureTypes = map.getLureTypes();
    data.lureTypes.forEach(lureType => {
        lureType.selected = lureType === lure.lureType;
    });
    data.cities = map.buildCityList(req.session.guilds);
    const areas = lure.city.map(x => x.toLowerCase());
    data.cities.forEach(city => {
        city.selected = areas.includes(city.name.toLowerCase());
    });
    res.render('lure-edit', data);
});

router.get('/lure/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('lure-delete', data);
});

router.get('/lures/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('lures-delete-all', data);
});


// Role assignment/unassignment routes
if (config.enableGeofenceRoles) {
    router.get('/roles', (req, res) => {
        const data = { ...defaultData };
        data.servers = validateRoles(req, res);
        res.render('roles', data);
    });

    router.get('/role/add', (req, res) => {
        const data = { ...defaultData };
        data.servers = validateRoles(req, res);
        data.roles = map.buildCityList(req.session.guilds);
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
    });
}


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
                    if (servers.length === 1) {
                        server.selected = true;
                    }
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

const getSelectedAreas = (guildId, currentAreas, availableAreas) => {
    // Loop through available areas, check if any current areas match
    // and mark as selected
    availableAreas.forEach(city => {
        if (city.name === 'None' && currentAreas.length === 0) {
            city.selected = true;
        } else {
            city.selected = currentAreas.includes(city.name.toLowerCase());
        }
    });
    // If no areas then insert 'None' as selected
    /*
    if (currentAreas.length === 0) {
        availableAreas.splice(0, 0, {
            name: 'None',
            guild: guildId,
            selected: true,
        });
    }
    */
    return availableAreas;
};

module.exports = router;
