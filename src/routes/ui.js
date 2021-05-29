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
const MapGym = require('../models/map/gym.js');
const Quest = require('../models/quest.js');
const Invasion = require('../models/invasion.js');
const Lure = require('../models/lure.js');
const Location = require('../models/location.js');
const Localizer = require('../services/locale.js');
const utils = require('../services/utils.js');
const PokestopQuest = require('../models/map/pokestop');


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
    res.render('pokemon/pokemon', data);
});

router.get('/pokemon/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.pokemon = await map.getPokemonNameIdsList();
    data.forms = Localizer.getFormNames();
    data.cities = map.buildCityList(req.session.guilds);
    data.locations = await map.buildLocationsList(req.session.guilds, req.session.user_id);
    res.render('pokemon/new', data);
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
    data.forms = Localizer.getFormNames();
    data.form = pokemon.form;
    data.iv = pokemon.minIv;
    data.iv_list = (pokemon.ivList || []).join('\n');
    data.min_lvl = pokemon.minLvl;
    data.max_lvl = pokemon.maxLvl;
    data.genders.forEach(gender => {
        data.selected = gender.id === pokemon.gender;
    });
    data.sizes.forEach(size => {
        size.selected = size.value === pokemon.size;
    });
    const cities = getSelectedAreas(
        // Current guild
        pokemon.guildId,
        // Currently subscribed areas list
        pokemon.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
    data.cities = JSON.stringify(cities.filter(x => x.selected).map(y => y.name));
    data.locations = await Location.getAll(pokemon.guildId, pokemon.userId);
    data.locations.forEach(loc => {
        loc.selected = loc.name === pokemon.location;
    });
    res.render('pokemon/edit', data);
});

router.get('/pokemon/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('pokemon/delete', data);
});

router.get('/pokemon/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('pokemon/delete-all', data);
});


// PVP routes
router.get('/pvp/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.pokemon = await map.getPokemonNameIdsList();
    data.forms = Localizer.getFormNames();
    data.cities = map.buildCityList(req.session.guilds);
    data.locations = await map.buildLocationsList(req.session.guilds, req.session.user_id);
    res.render('pvp/new', data);
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
    data.forms = Localizer.getFormNames();
    data.form = pvp.form;
    data.leagues.forEach(league => {
        league.selected = league.name === pvp.league;
    });
    data.min_rank = pvp.minRank;
    data.min_percent = pvp.minPercent;
    const cities = getSelectedAreas(
        // Current guild
        pvp.guildId,
        // Currently subscribed areas list
        pvp.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
    data.cities = JSON.stringify(cities.filter(x => x.selected).map(y => y.name));
    data.locations = await Location.getAll(pvp.guildId, pvp.userId);
    data.locations.forEach(loc => {
        loc.selected = loc.name === pvp.location;
    });
    res.render('pvp/edit', data);
});

router.get('/pvp/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('pvp/delete', data);
});

router.get('/pvp/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('pvp/delete-all', data);
});


// Raid routes
router.get('/raids', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('raids/raids', data);
});

router.get('/raid/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.pokemon = await map.getPokemonNameIdsList();
    data.forms = Localizer.getFormNames();
    data.cities = map.buildCityList(req.session.guilds);
    data.locations = await map.buildLocationsList(req.session.guilds, req.session.user_id);
    res.render('raids/new', data);
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
    data.forms = Localizer.getFormNames();
    data.form = raid.form;
    const cities = getSelectedAreas(
        // Current guild
        raid.guildId,
        // Currently subscribed areas list
        raid.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
    data.cities = JSON.stringify(cities.filter(x => x.selected).map(y => y.name));
    data.locations = await Location.getAll(raid.guildId, raid.userId);
    data.locations.forEach(loc => {
        loc.selected = loc.name === raid.location;
    });
    res.render('raids/edit', data);
});

router.get('/raid/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('raids/delete', data);
});

router.get('/raids/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('raids/delete-all', data);
});


// Gym routes
router.get('/gym/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const gyms = await MapGym.getAll();
    const sorted = gyms.map(x => x.name).sort();
    data.gyms = [...new Set(sorted)];
    data.pokemon = await map.getPokemonNameIdsList();
    data.locations = await map.buildLocationsList(req.session.guilds, req.session.user_id);
    res.render('gyms/new', data);
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
    const gyms = await MapGym.getAll();
    const sorted = gyms.map(x => x.name).sort();
    data.gyms = [...new Set(sorted)];
    data.pokemon = await map.getPokemonNameIdsList();
    data.pokemon.forEach(pkmn => {
        pkmn.selected = gym.pokemonIds.includes(pkmn.id.toString());
    });
    data.pokemon_ids = gym.pokemonIds;
    data.name = gym.name;
    data.min_level = gym.minLevel;
    data.max_level = gym.maxLevel;
    data.locations = await Location.getAll(gym.guildId, gym.userId);
    data.locations.forEach(loc => {
        loc.selected = loc.name === gym.location;
    });
    res.render('gyms/edit', data);
});

router.get('/gym/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('gyms/delete', data);
});

router.get('/gyms/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('gyms/delete-all', data);
});


// Quest routes
router.get('/quests', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('quests/quests', data);
});

router.get('/quest/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.rewards = await map.getQuestRewards();
    data.cities = map.buildCityList(req.session.guilds);
    data.locations = await map.buildLocationsList(req.session.guilds, req.session.user_id);
    res.render('quests/new', data);
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
    const cities = getSelectedAreas(
        // Current guild
        quest.guildId,
        // Currently subscribed areas list
        quest.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
    data.cities = JSON.stringify(cities.filter(x => x.selected).map(y => y.name));
    data.locations = await Location.getAll(quest.guildId, quest.userId);
    data.locations.forEach(loc => {
        loc.selected = loc.name === quest.location;
    });
    res.render('quests/edit', data);
});

router.get('/quest/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('quests/delete', data);
});

router.get('/quests/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('quests/delete-all', data);
});


// Invasion routes
router.get('/invasions', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('invasions/invasions', data);
});

router.get('/invasion/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.types = map.getInvasionTypes();
    const pokestopNames = await PokestopQuest.getPokestopNames();
    data.pokestops = [...new Set(pokestopNames)];
    data.rewards = await map.getPokemonNameIdsList();
    data.cities = map.buildCityList(req.session.guilds);
    data.locations = await map.buildLocationsList(req.session.guilds, req.session.user_id);
    res.render('invasions/new', data);
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
    const pokestopNames = await PokestopQuest.getPokestopNames();
    data.pokestops = [...new Set(pokestopNames)];
    data.name = invasion.pokestopName;
    const types = map.getInvasionTypes();
    data.types = types.map(x => {
        return { id: x.id, name: x.name, selected: x.id === invasion.gruntType };
    });
    data.rewards = await map.getPokemonNameIdsList();
    data.rewards.forEach(reward => {
        reward.selected = reward.id === invasion.rewardPokemonId;
    });
    const cities = getSelectedAreas(
        // Current guild
        invasion.guildId,
        // Currently subscribed areas list
        invasion.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
    data.cities = JSON.stringify(cities.filter(x => x.selected).map(y => y.name));
    data.locations = await Location.getAll(invasion.guildId, invasion.userId);
    data.locations.forEach(loc => {
        loc.selected = loc.name === invasion.location;
    });
    res.render('invasions/edit', data);
});

router.get('/invasion/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('invasions/delete', data);
});

router.get('/invasions/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('invasions/delete-all', data);
});


// Lure routes
router.get('/lures', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('lures/lures', data);
});

router.get('/lure/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.lureTypes = map.getLureTypes();
    data.cities = map.buildCityList(req.session.guilds);
    data.locations = await map.buildLocationsList(req.session.guilds, req.session.user_id);
    res.render('lures/new', data);
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
    const cities = getSelectedAreas(
        // Current guild
        lure.guildId,
        // Currently subscribed areas list
        lure.city.map(x => x.toLowerCase()),
        // All areas list
        map.buildCityList(req.session.guilds)
    );
    data.cities = JSON.stringify(cities.filter(x => x.selected).map(y => y.name));
    data.locations = await Location.getAll(lure.guildId, lure.userId);
    data.locations.forEach(loc => {
        loc.selected = loc.name === lure.location;
    });
    res.render('lures/edit', data);
});

router.get('/lure/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('lures/delete', data);
});

router.get('/lures/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('lures/delete-all', data);
});


// Location routes
router.get('/locations', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('locations/locations', data);
});

router.get('/location/new', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('locations/new', data);
});

router.get('/location/edit/:id', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const id = req.params.id;
    data.id = id;
    const location = await Location.getById(id);
    if (!location) {
        res.redirect('/locations');
        return;
    }
    data.name = location.name;
    data.distance = location.distance;
    data.location = `${location.latitude},${location.longitude}`;
    res.render('locations/edit', data);
});

router.get('/location/delete/:id', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    data.id = req.params.id;
    res.render('locations/delete', data);
});

router.get('/locations/delete_all', (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    res.render('locations/delete-all', data);
});


// Role assignment/unassignment routes
if (config.enableGeofenceRoles) {
    router.get('/roles', (req, res) => {
        const data = { ...defaultData };
        data.servers = validateRoles(req, res);
        res.render('roles/roles', data);
    });

    router.get('/role/add', (req, res) => {
        const data = { ...defaultData };
        data.servers = validateRoles(req, res);
        data.roles = map.buildCityList(req.session.guilds);
        res.render('roles/add', data);
    });

    router.get('/role/remove/:id', (req, res) => {
        const data = { ...defaultData };
        data.servers = validateRoles(req, res);
        res.render('roles/remove', data);
    });

    router.get('/roles/remove_all', (req, res) => {
        const data = { ...defaultData };
        data.servers = validateRoles(req, res);
        res.render('roles/remove-all', data);
    });
}


// Settings routes
router.get('/settings', async (req, res) => {
    const data = { ...defaultData };
    data.servers = validateRoles(req, res);
    const locations = await map.buildLocationsList(req.session.guilds, req.session.user_id);
    data.locations = locations.map(x => { return {
        name: x.name,
        guild: x.guild,
        selected: false,
    };});
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
    return availableAreas;
};

module.exports = router;
