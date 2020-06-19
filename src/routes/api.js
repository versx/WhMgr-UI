'use strict';

const express = require('express');
const router = express.Router();

const defaultData = require('../data/default.js');
const subscriptions = require('../data/subscriptions.js');
const Pokemon = require('../models/pokemon.js');
const PVP = require('../models/pvp.js');
const Raid = require('../models/raid.js');
const Gym = require('../models/gym.js');
const Quest = require('../models/quest.js');
const Invasion = require('../models/invasion.js');
const utils = require('../services/utils.js');


router.post('/server/:guild_id/user/:user_id', async (req, res) => {
    const { guild_id, user_id } = req.params;
    if (guild_id === null) {
        console.warn('[WARN] Guild ID is null.');
        return;
    }
    const type = req.query.type;
    switch (type) {
        case 'subscriptions':
            const subscription = await subscriptions.getUserSubscriptionStats(guild_id, user_id);
            res.json({ data: { subscriptions: subscription } });
            break;
        case 'pokemon':
            const pokemon = await subscriptions.getPokemonSubscriptions(guild_id, user_id);
            if (pokemon) {
                pokemon.forEach(pkmn => {
                    pkmn.name = `<img src='${utils.getPokemonIcon(pkmn.pokemon_id, pkmn.form)}' width='auto' height='48'>&nbsp;${pkmn.name}`;
                    /*
                    pkmn.gender === '*'
                    ? 'All'
                    : pkmn.gender === 'm'
                        ? 'Male Only'
                        : 'Female Only';
                    */
                    pkmn.buttons = `
                    <a href='/pokemon/edit/${pkmn.id}'><button type='button'class='btn btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/pokemon/delete/${pkmn.id}'><button type='button'class='btn btn-danger'>Delete</button></a>
                    `;
                });
            }
            res.json({ data: { pokemon: pokemon } });
            break;
        case 'pvp':
            const pvp = await subscriptions.getPvpSubscriptions(guild_id, user_id);
            if (pvp) {
                pvp.forEach(pvpSub => {
                    pvpSub.name = `<img src='${utils.getPokemonIcon(pvpSub.pokemon_id, pvpSub.form)}' width='auto' height='48'>&nbsp;${pvpSub.name}`;
                    pvpSub.buttons = `
                    <a href='/pvp/edit/${pvpSub.id}'><button type='button'class='btn btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/pvp/delete/${pvpSub.id}'><button type='button'class='btn btn-danger'>Delete</button></a>
                    `;
                });
            }
            res.json({ data: { pvp: pvp } });
            break;
        case 'raids':
            const raids = await subscriptions.getRaidSubscriptions(guild_id, user_id);
            if (raids) {
                raids.forEach(raid => {
                    raid.name = `<img src='${utils.getPokemonIcon(raid.pokemon_id, raid.form)}' width='auto' height='48'>&nbsp;${raid.name}`;
                    raid.buttons = `
                    <a href='/raid/edit/${raid.id}'><button type='button'class='btn btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/raid/delete/${raid.id}'><button type='button'class='btn btn-danger'>Delete</button></a>
                    `;
                });
            }
            res.json({ data: { raids: raids } });
            break;
        case 'gyms':
            const gyms = await subscriptions.getGymSubscriptions(guild_id, user_id);
            if (gyms) {
                gyms.forEach(gym => {
                    gym.buttons = `
                    <a href='/gym/delete/${gym.id}'><button type='button'class='btn btn-danger'>Delete</button></a>
                    `;
                });
            }
            res.json({ data: { gyms: gyms } });
            break;
        case 'quests':
            const quests = await subscriptions.getQuestSubscriptions(guild_id, user_id);
            if (quests) {
                quests.forEach(quest => {
                    quest.buttons = `
                    <a href='/quest/edit/${quest.id}'><button type='button'class='btn btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/quest/delete/${quest.id}'><button type='button'class='btn btn-danger'>Delete</button></a>
                    `;
                });
            }
            res.json({ data: { quests: quests } });
            break;
        case 'invasions':
            const invasions = await subscriptions.getInvasionSubscriptions(guild_id, user_id);
            if (invasions) {
                invasions.forEach(invasion => {
                    invasion.reward = `<img src='${utils.getPokemonIcon(invasion.reward_pokemon_id, 0)}' width='auto' height='48'>&nbsp;${invasion.reward}`;
                    invasion.buttons = `
                    <a href='/invasion/edit/${invasion.id}'><button type='button'class='btn btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/invasion/delete/${invasion.id}'><button type='button'class='btn btn-danger'>Delete</button></a>
                    `;
                });
            }
            res.json({ data: { invasions: invasions } });
            break;
        case 'settings':
            const settings = await subscriptions.getSubscriptionSettings(guild_id, user_id);
            const formatted = req.query.formatted;
            if (formatted) {
                let list = [];
                const keys = Object.keys(settings);
                keys.forEach(key => {
                    list.push({ 'name': key.toUpperCase(), 'value': settings[key] });
                });
                res.json({ data: { settings: list } });
            } else {
                res.json({ data: { settings: settings } });
            }
            break;
    }
});


// Pokemon routes
router.post('/pokemon/new', async (req, res) => {
    const {
        guild_id,
        pokemon,
        form,
        iv,
        min_lvl,
        max_lvl,
        gender,
        city
    } = req.body;
    const user_id = defaultData.user_id;
    /*
    let cities = city;
    if (!Array.isArray(city)) {
        cities = [city];
    }
    for (let i = 0; i < cities.length; i++) {
        const area = cities[i];
    }
    */
    const split = pokemon.split(',');
    for (let i = 0; i < split.length; i++) {
        const pokemonId = split[i];
        const exists = await Pokemon.getByPokemon(guild_id, user_id, pokemonId, form);
        if (exists) {
            // Already exists
            // TODO: Update already existing
            console.log('Already exists');
        } else {
            const pkmn = new Pokemon(
                guild_id,
                user_id,
                pokemonId,
                form,
                0,
                pokemonId === 201 ? 0 : iv || 0,
                min_lvl || 0,
                max_lvl || 35,
                gender || '*'
            );
            const result = await pkmn.create();
            if (result) {
                // Success
                console.log('Pokemon subscription for Pokemon', pokemon, 'created successfully.');
            }
        }
    }
    res.redirect('/pokemon');
});

router.post('/pokemon/edit/:id', async (req, res) => {
    const id = req.params.id;
    const {
        guild_id,
        pokemon,
        form,
        iv,
        min_lvl,
        max_lvl,
        gender,
        city
    } = req.body;
    const user_id = defaultData.user_id;
    const pkmn = await Pokemon.getById(id);
    // TODO: Check if pokemon is rare (Unown, Azelf, etc), set IV value to 0.
    if (pkmn) {
        const result = await Pokemon.save(
            id,
            guild_id,
            user_id,
            pokemon,
            form,
            0,
            pokemonId === 201 ? 0 : iv || 0,
            min_lvl || 0,
            max_lvl || 35,
            gender || '*'
        );
        if (result) {
            // Success
            console.log('Pokemon subscription', id, 'updated successfully.');
        }
    }
    res.redirect('/pokemon');
});

router.post('/pokemon/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Pokemon.getById(id);
    if (exists) {
        const result = await Pokemon.deleteById(id);
        if (result) {
            // Success
            console.log('Pokemon subscription', id, 'deleted successfully.');
        }
    } else {
        // Does not exist
    }
    res.redirect('/pokemon');
});

router.post('/pokemon/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = defaultData.user_id;
    if (guild_id && user_id) {
        const result = await Pokemon.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            console.log('All Pokemon subscriptions deleted for guild:', guild_id, 'user:', user_id);
        }
    } else {
        console.error('Guild ID or User ID not set, failed to delete all pokemon subscriptions for user.');
    }
    res.redirect('/pokemon');
});


// PVP routes
router.post('/pvp/new', async (req, res) => {
    const {
        guild_id,
        pokemon,
        form,
        league,
        min_rank,
        min_percent,
        city
    } = req.body;
    const user_id = defaultData.user_id;
    const exists = await PVP.getPokemonByLeague(guild_id, user_id, pokemon, form, league);
    if (exists) {
        // Already exists
    } else {
        const pvp = new PVP(guild_id, user_id, pokemon, form, league, min_rank, min_percent);
        const result = await pvp.create();
        if (result) {
            // Success
            console.log('PVP subscription for Pokemon', pokemon, 'created successfully.');
        }
    }
    res.redirect('/pokemon#pvp');
});

router.post('/pvp/edit/:id', async (req, res) => {
    const id = req.params.id;
    const {
        guild_id,
        pokemon,
        form,
        league,
        min_rank,
        min_percent,
        city
    } = req.body;
    const user_id = defaultData.user_id;
    const exists = await PVP.getById(id);
    if (exists) {
        const result = await PVP.save(id, guild_id, user_id, pokemon, form, league, min_rank, min_percent);
        if (result) {
            // Success
            console.log('PVP subscription', id, 'updated successfully.');
        }
    }
    res.redirect('/pokemon#pvp');
});

router.post('/pvp/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await PVP.getById(id);
    if (exists) {
        const result = await PVP.deleteById(id);
        if (result) {
            // Success
            console.log('PVP subscription with id', id, 'deleted successfully.');
        }
    } else {
        // Does not exist
    }
    res.redirect('/pokemon#pvp');
});

router.post('/pvp/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = defaultData.user_id;
    if (guild_id && user_id) {
        const result = await PVP.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            console.log('All PVP subscriptions deleted for guild:', guild_id, 'user:', user_id);
        }
    } else {
        console.error('Guild ID or User ID not set, failed to delete all PVP subscriptions for user.');
    }
    res.redirect('/pokemon#pvp');
});


// Raid routes
router.post('/raids/new', async (req, res) => {
    const { guild_id, pokemon, form, city } = req.body;
    const user_id = defaultData.user_id;
    let cities = city;
    if (!Array.isArray(city)) {
        cities = [city];
    }
    for (let i = 0; i < cities.length; i++) {
        const area = cities[i];
        const exists = await Raid.getByPokemon(guild_id, user_id, pokemon, form, area);
        if (exists) {
            // Already exists
        } else {
            const raid = new Raid(guild_id, user_id, pokemon, form, area);
            const result = await raid.create();
            if (result) {
                // Success
                console.log('Raid subscription for Pokemon', pokemon, 'created successfully.');
            }
        }
    }
    res.redirect('/raids');
});

router.post('/raids/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, pokemon, form, city } = req.body;
    const user_id = defaultData.user_id;
    const raid = await Raid.getById(id);
    if (raid) {
        const result = await Raid.save(id, guild_id, user_id, pokemon, form, city);
        if (result) {
            // Success
            console.log('Raid subscription', id, 'updated successfully.');
        }
    }
    res.redirect('/raids');
});

router.post('/raids/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Raid.getById(id);
    if (exists) {
        const result = await Raid.deleteById(id);
        if (result) {
            // Success
            console.log('Raid subscription with id', id, 'deleted successfully.');
        }
    } else {
        // Does not exist
    }
    res.redirect('/raids');
});

router.post('/raids/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = defaultData.user_id;
    if (guild_id && user_id) {
        const result = await Raid.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            console.log('All raid subscriptions deleted for guild:', guild_id, 'user:', user_id);
        }
    } else {
        console.error('Guild ID or User ID not set, failed to delete all raid subscriptions for user.');
    }
    res.redirect('/raids');
});


// Gym routes
router.post('/gyms/new', async (req, res) => {
    const { guild_id, name } = req.body;
    const user_id = defaultData.user_id;
    const exists = await Gym.getByName(guild_id, user_id, name);
    if (exists) {
        // Already exists
    } else {
        const gym = new Gym(guild_id, user_id, name);
        const result = await gym.create();
        if (result) {
            // Success
            console.log('Gym subscription for gym', name, 'created successfully.');
        }
    }
    res.redirect('/raids');
});

router.post('/gyms/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Gym.getById(id);
    if (exists) {
        const result = await Gym.deleteById(id);
        if (result) {
            // Success
            console.log('Gym subscription with id', id, 'deleted successfully.');
        }
    } else {
        // Does not exist
    }
    res.redirect('/raids');
});

router.post('/gyms/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = defaultData.user_id;
    if (guild_id && user_id) {
        const result = await Gym.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            console.log('All gym subscriptions deleted for guild:', guild_id, 'user:', user_id);
        }
    } else {
        console.error('Guild ID or User ID not set, failed to delete all gym subscriptions for user.');
    }
    res.redirect('/raids');
});


// Quest routes
router.post('/quests/new', async (req, res) => {
    const { guild_id, reward, city } = req.body;
    const user_id = defaultData.user_id;
    let cities = city;
    if (!Array.isArray(city)) {
        cities = [city];
    }
    for (let i = 0; i < cities.length; i++) {
        const area = cities[i];
        const exists = await Quest.getByReward(guild_id, user_id, reward, area);
        if (exists) {
            // Already exists
        } else {
            const quest = new Quest(guild_id, user_id, reward, area);
            const result = await quest.create();
            if (result) {
                // Success
                console.log('Quest subscription for reward', reward, 'created successfully.');
            }
        }
    }
    res.redirect('/quests');
});

router.post('/quests/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, reward, city } = req.body;
    const user_id = defaultData.user_id;
    const quest = await Quest.getById(id);
    if (quest) {
        const result = await Quest.save(id, guild_id, user_id, reward, city);
        if (result) {
            // Success
            console.log('Quest subscription', id, 'updated successfully.');
        }
    }
    res.redirect('/quests');
});

router.post('/quests/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Quest.getById(id);
    if (exists) {
        const result = await Quest.deleteById(id);
        if (result) {
            // Success
            console.log('Quest subscription with id', id, 'deleted successfully.');
        }
    } else {
        // Does not exist
    }
    res.redirect('/quests');
});

router.post('/quests/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = defaultData.user_id;
    if (guild_id && user_id) {
        const result = await Quest.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            console.log('All quest subscriptions deleted for guild:', guild_id, 'user:', user_id);
        }
    } else {
        console.error('Guild ID or User ID not set, failed to delete all quest subscriptions for user.');
    }
    res.redirect('/quests');
});


// Invasion routes
router.post('/invasions/new', async (req, res) => {
    const { guild_id, pokemon, city } = req.body;
    const user_id = defaultData.user_id;
    let cities = city;
    if (!Array.isArray(city)) {
        cities = [city];
    }
    for (let i = 0; i < cities.length; i++) {
        const area = cities[i];
        const exists = await Invasion.getByReward(guild_id, user_id, pokemon, area);
        if (exists) {
            // Already exists
            console.log('Invasion subscription with reward', pokemon, 'already exists.');
        } else {
            const invasion = new Invasion(guild_id, user_id, pokemon, area);
            const result = await invasion.create();
            if (result) {
                // Success
                console.log('Invasion subscription for reward', pokemon, 'created successfully.');
            }
        }
    }
    res.redirect('/invasions');
});

router.post('/invasions/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, reward, city } = req.body;
    const user_id = defaultData.user_id;
    const invasion = await Invasion.getById(id);
    if (invasion) {
        const result = await Invasion.save(id, guild_id, user_id, reward, city);
        if (result) {
            // Success
            console.log('Invasion subscription', id, 'updated successfully.');
        }
    }
    res.redirect('/invasions');
});

router.post('/invasions/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Invasion.getById(id);
    if (exists) {
        const result = await Invasion.deleteById(id);
        if (result) {
            // Success
            console.log('Invasion subscription with id', id, 'deleted successfully.');
        }
    } else {
        // Does not exist
    }
    res.redirect('/invasions');
});

router.post('/invasions/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = defaultData.user_id;
    if (guild_id && user_id) {
        const result = await Invasion.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            console.log('All invasion subscriptions deleted for guild:', guild_id, 'user:', user_id);
        }
    } else {
        console.error('Guild ID or User ID not set, failed to delete all invasion subscriptions for user.');
    }
    res.redirect('/invasions');
});


// Settings routes
router.post('/settings', async (req, res) => {
    const {
        guild_id,
        icon_style,
        location,
        distance,
        enabled
    } = req.body;
    const user_id = defaultData.user_id;
    const split = (location || '0,0').split(',');
    const lat = parseFloat(split[0]);
    const lon = parseFloat(split[1]);
    const result = subscriptions.setSubscriptionSettings(
        guild_id,
        user_id,
        enabled === 'checked',
        distance,
        lat,
        lon,
        icon_style
    );
    if (result) {
        // Success
    }
    res.redirect('/settings');
});

module.exports = router;