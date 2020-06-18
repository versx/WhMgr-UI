'use strict';

const express = require('express');
const router = express.Router();

const defaultData = require('../data/default.js');
const subscriptions = require('../data/subscriptions.js');
const Raid = require('../models/raid.js');
const Quest = require('../models/quest.js');
const Invasion = require('../models/invasion.js');
const utils = require('../services/utils.js');

router.post('/server/:guild_id/user/:user_id', async (req, res) => {
    const { guild_id, user_id } = req.params;
    const type = req.query.type;
    console.log('Path:', req.path);
    console.log('Query:', req.query);

    if (guild_id === null) {
        console.warn('[WARN] Guild ID is null.');
        return;
    }

    switch (type) {
        case 'subscriptions':
            const subscription = await subscriptions.getUserSubscriptionStats(guild_id, user_id);
            res.json({ data: { subscriptions: subscription } });
            break;
        case 'pokemon':
            const pokemon = await subscriptions.getPokemonSubscriptions(guild_id, user_id);
            if (pokemon) {
                pokemon.forEach(pkmn => {
                    pkmn.name = `<img src='${utils.getPokemonIcon(pkmn.pokemon_id, pkmn.form)}' width='auto' height='64'>&nbsp;${pkmn.name}`;
                    pkmn.buttons = `
                    <a href='/pokemon/edit/${pkmn.id}'><button type='button'class='btn btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/pokemon/delete/${pkmn.id}'><button type='button'class='btn btn-danger'>Delete</button></a>
                    `;
                });
            }
            res.json({ data: { pokemon: pokemon } });
            break;
        case 'raids':
            const raids = await subscriptions.getRaidSubscriptions(guild_id, user_id);
            if (raids) {
                raids.forEach(raid => {
                    raid.name = `<img src='${utils.getPokemonIcon(raid.pokemon_id, 0)}' width='auto' height='64'>&nbsp;${raid.name}`;
                    raid.buttons = `
                    <a href='/raid/edit/${raid.id}'><button type='button'class='btn btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/raid/delete/${raid.id}'><button type='button'class='btn btn-danger'>Delete</button></a>
                    `;
                });
                console.log("Raids:", raids);
            }
            res.json({ data: { raids: raids } });
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
                    invasion.reward = `<img src='${utils.getPokemonIcon(invasion.reward_pokemon_id, 0)}' width='auto' height='64'>&nbsp;${invasion.reward}`;
                    invasion.buttons = `
                    <a href='/invasion/edit/${invasion.id}'><button type='button'class='btn btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/invasion/delete/${invasion.id}'><button type='button'class='btn btn-danger'>Delete</button></a>
                    `;
                });
            }
            res.json({ data: { invasions: invasions } });
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
        lvl,
        gender,
        city
    } = req.body;
    const user_id = defaultData.user_id;
    let cities = city;
    if (!Array.isArray(city)) {
        cities = [city];
    }
    for (let i = 0; i < cities.length; i++) {
        const area = cities[i];
    }
    res.redirect('/pokemon');
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
            }
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
        }
    } else {
        // Does not exist
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
            }
        }
    }
    res.redirect('/quests');
});

router.post('/quests/edit', async (req, res) => {
});

router.post('/quests/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Quest.getById(id);
    if (exists) {
        const result = await Quest.deleteById(id);
        if (result) {
            // Success
        }
    } else {
        // Does not exist
    }
    res.redirect('/quests');
});


// Invasion routes
router.post('/invasions/new', async (req, res) => {
    const { guild_id, reward, city } = req.body;
    const user_id = defaultData.user_id;
    let cities = city;
    if (!Array.isArray(city)) {
        cities = [city];
    }
    for (let i = 0; i < cities.length; i++) {
        const area = cities[i];
        const exists = await Invasion.getByReward(guild_id, user_id, reward, area);
        if (exists) {
            // Already exists
            console.log('Invasion subscription with reward', reward, 'already exists.');
        } else {
            const invasion = new Invasion(guild_id, user_id, reward, area);
            const result = await invasion.create();
            if (result) {
                // Success
                console.log('Invasion subscription for reward', reward, 'created successfully.');
            }
        }
    }
    res.redirect('/invasions');
});

router.post('/invasions/edit', async (req, res) => {
});

router.post('/invasions/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Invasion.getById(id);
    if (exists) {
        const result = await Invasion.deleteById(id);
        if (result) {
            // Success
        }
    } else {
        // Does not exist
    }
    res.redirect('/invasions');
});

module.exports = router;