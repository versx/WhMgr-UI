'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config.json');
const defaultData = require('../data/default.js');
const Pokemon = require('../models/pokemon.js');
const PVP = require('../models/pvp.js');
const Raid = require('../models/raid.js');
const Gym = require('../models/gym.js');
const Quest = require('../models/quest.js');
const Invasion = require('../models/invasion.js');
const Subscription = require('../models/subscription.js');
const Localizer = require('../services/locale.js');
const utils = require('../services/utils.js');

/* eslint-disable no-case-declarations */
router.post('/server/:guild_id/user/:user_id', async (req, res) => {
    const { guild_id, user_id } = req.params;
    const type = req.query.type;
    switch (type) {
        case 'subscriptions':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Please select a server from the dropdown menu!', { subscriptions: { pokemon: 0, pvp: 0, raids: 0, gyms: 0, quests: 0, invasions: 0 }, clients_online: 0 });
                return;
            }
            const subscriptions = {
                pokemon: await Pokemon.getCount(guild_id, user_id),
                pvp: await PVP.getCount(guild_id, user_id),
                raids: await Raid.getCount(guild_id, user_id),
                quests: await Quest.getCount(guild_id, user_id),
                invasions: await Invasion.getCount(guild_id, user_id),
                gyms: await Gym.getCount(guild_id, user_id),
            };
            req.sessionStore.length((err, length) => {
                if (err) {
                    console.error('Failed to get session store length:', err);
                    return;
                }
                res.json({ data: { subscriptions: subscriptions, clients_online: length } });
            });
            break;
        case 'pokemon':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Please select a server from the dropdown menu!', { pokemon: [] });
                return;
            }
            const pokemon = await Pokemon.getAll(guild_id, user_id);
            const pokemonData = [];
            if (pokemon) {
                for (let pkmn of pokemon) {
                    pkmn = pkmn.toJSON();
                    const pkmnName = Localizer.getPokemonName(pkmn.pokemonId);
                    const pkmnIcon = await Localizer.getPokemonIcon(pkmn.pokemonId);
                    pkmn.name = `<img src='${pkmnIcon}' width='auto' height='32'>&nbsp;${pkmnName}`;
                    pkmn.cp = `${pkmn.minCp}-4096`;
                    pkmn.iv = pkmn.minIv;
                    pkmn.ivList = pkmn.ivList.length;//(JSON.parse(pkmn.iv_list || '[]') || []).length;
                    pkmn.lvl = `${pkmn.minLvl}-${pkmn.maxLvl}`;
                    pkmn.gender = pkmn.gender === '*'
                        ? 'All'
                        : pkmn.gender == 'm'
                            ? 'Male Only'
                            : 'Female Only';
                    pkmn.genderName = pkmn.gender === '*' ? 'All' : pkmn.gender;
                    pkmn.city = formatAreas(guild_id, pkmn.city);
                    pkmn.buttons = `
                    <a href='/pokemon/edit/${pkmn.id}'><button type='button'class='btn btn-sm btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/pokemon/delete/${pkmn.id}'><button type='button'class='btn btn-sm btn-danger'>Delete</button></a>
                    `;
                    pokemonData.push(pkmn);
                }
            }
            res.json({ data: { pokemon: pokemonData } });
            break;
        case 'pvp':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Please select a server from the dropdown menu!', { pvp: [] });
                return;
            }
            const pvp = await PVP.getAll(guild_id, user_id);
            const pvpData = [];
            if (pvp) {
                for (let pvpSub of pvp) {
                    pvpSub = pvpSub.toJSON();
                    const pkmnName = Localizer.getPokemonName(pvpSub.pokemonId);
                    const pkmnIcon = await Localizer.getPokemonIcon(pvpSub.pokemonId);
                    pvpSub.name = `<img src='${pkmnIcon}' width='auto' height='32'>&nbsp;${pkmnName}`;
                    pvpSub.city = formatAreas(guild_id, pvpSub.city);
                    pvpSub.buttons = `
                    <a href='/pvp/edit/${pvpSub.id}'><button type='button'class='btn btn-sm btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/pvp/delete/${pvpSub.id}'><button type='button'class='btn btn-sm btn-danger'>Delete</button></a>
                    `;
                    pvpData.push(pvpSub);
                }
            }
            res.json({ data: { pvp: pvpData } });
            break;
        case 'raids':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Please select a server from the dropdown menu!', { raids: [] });
                return;
            }
            const raids = await Raid.getAll(guild_id, user_id);
            const raidData = [];
            if (raids) {
                for (let raid of raids) {
                    raid = raid.toJSON();
                    const pkmnName = Localizer.getPokemonName(raid.pokemonId);
                    const pkmnIcon = await Localizer.getPokemonIcon(raid.pokemonId);
                    raid.name = `<img src='${pkmnIcon}' width='auto' height='32'>&nbsp;${pkmnName}`;
                    raid.city = formatAreas(guild_id, raid.city);
                    raid.buttons = `
                    <a href='/raid/edit/${raid.id}'><button type='button'class='btn btn-sm btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/raid/delete/${raid.id}'><button type='button'class='btn btn-sm btn-danger'>Delete</button></a>
                    `;
                    raidData.push(raid);
                }
            }
            res.json({ data: { raids: raidData } });
            break;
        case 'gyms':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Please select a server from the dropdown menu!', { gyms: [] });
                return;
            }
            const gyms = await Gym.getAll(guild_id, user_id);
            const gymData = [];
            if (gyms) {
                for (let gym of gyms) {
                    gym = gym.toJSON();
                    gym.buttons = `
                    <a href='/gym/delete/${gym.id}'><button type='button'class='btn btn-sm btn-danger'>Delete</button></a>
                    `;
                    gymData.push(gym);
                }
            }
            res.json({ data: { gyms: gymData } });
            break;
        case 'quests':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Please select a server from the dropdown menu!', { quests: [] });
                return;
            }
            const quests = await Quest.getAll(guild_id, user_id);
            const questData = [];
            if (quests) {
                for (let quest of quests) {
                    quest = quest.toJSON();
                    quest.city = formatAreas(guild_id, quest.city);
                    quest.buttons = `
                    <a href='/quest/edit/${quest.id}'><button type='button'class='btn btn-sm btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/quest/delete/${quest.id}'><button type='button'class='btn btn-sm btn-danger'>Delete</button></a>
                    `;
                    questData.push(quest);
                }
            }
            res.json({ data: { quests: questData } });
            break;
        case 'invasions':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Please select a server from the dropdown menu!', { invasions: [] });
                return;
            }
            const invasions = await Invasion.getAll(guild_id, user_id);
            const invasionData = [];
            if (invasions) {
                for (let invasion of invasions) {
                    invasion = invasion.toJSON();
                    const pkmnName = Localizer.getPokemonName(invasion.rewardPokemonId);
                    const pkmnIcon = await Localizer.getPokemonIcon(invasion.rewardPokemonId);
                    invasion.reward = `<img src='${pkmnIcon}' width='auto' height='32'>&nbsp;${pkmnName}`;
                    invasion.city = formatAreas(guild_id, invasion.city);
                    invasion.buttons = `
                    <a href='/invasion/edit/${invasion.id}'><button type='button'class='btn btn-sm btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/invasion/delete/${invasion.id}'><button type='button'class='btn btn-sm btn-danger'>Delete</button></a>
                    `;
                    invasionData.push(invasion);
                }
            }
            res.json({ data: { invasions: invasionData } });
            break;
        case 'settings':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Please select a server from the dropdown menu!', { settings: [] });
                return;
            }
            const settings = (await Subscription.getSubscription(guild_id, user_id)).toJSON();
            const formatted = req.query.formatted;
            if (formatted) {
                const list = [];
                const keys = Object.keys(settings);
                const ignoreKeys = ['id', 'guildId', 'userId'];
                keys.forEach(key => {
                    if (!ignoreKeys.includes(key)) {
                        list.push({ 'name': key.toUpperCase(), 'value': settings[key] });
                    }
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
        iv_list,
        min_lvl,
        max_lvl,
        gender,
        city
    } = req.body;
    const user_id = defaultData.user_id;
    const areas = getAreas(guild_id, city);
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'pokemon-new', `Failed to get user subscription for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    const sql = [];
    const split = pokemon.split(',');
    const ivList = iv_list ? iv_list.replace('\r', '').split('\n') : [];
    for (const pokemonId of split) {
        let exists = await Pokemon.getByPokemon(guild_id, user_id, pokemonId, form);
        if (exists) {
            exists.minCp = 0;
            exists.minIv = iv || 0;
            exists.ivList = ivList;
            exists.minLvl = min_lvl || 0;
            exists.maxLvl = max_lvl || 35;
            exists.gender = gender || '*';
            exists.city = utils.arrayUnique(exists.city.concat(areas));
        } else {
            exists = Pokemon.build({
                id: 0,
                subscriptionId: subscription.id,
                guildId: guild_id,
                userId: user_id,
                pokemonId: pokemonId,
                form: form || null,
                minCp: 0,
                minIv: isUltraRarePokemon(pokemonId) ? 0 : iv || 0,
                ivList: ivList,
                minLvl: min_lvl || 0,
                maxLvl: max_lvl || 35,
                gender: gender || '*',
                city: areas,
            });
        }
        sql.push(exists.toJSON());
    }
    try {
        await Pokemon.create(sql);
    } catch (err) {
        console.error(err);
        showError(res, 'pokemon-new', `Failed to create Pokemon ${pokemon} subscriptions for guild: ${guild_id} user: ${user_id}`);
        return;
    }
    res.redirect('/pokemon');
});

router.post('/pokemon/edit/:id', async (req, res) => {
    const id = req.params.id;
    const {
        guild_id,
        //pokemon,
        form,
        iv,
        iv_list,
        min_lvl,
        max_lvl,
        gender,
        city
    } = req.body;
    //const user_id = defaultData.user_id;
    const pkmn = await Pokemon.getById(id);
    const areas = getAreas(guild_id, city);
    if (pkmn) {
        const ivList = iv_list ? iv_list.replace('\r', '').split('\n') : [];
        //pkmn.pokemonId = pokemon;
        pkmn.form = form;
        pkmn.minCp = 0;
        // If pokemon is rare (Unown, Azelf, etc), set IV value to 0
        pkmn.minIv = isUltraRarePokemon(pkmn.pokemonId) ? 0 : iv || 100;
        pkmn.ivList = ivList;
        pkmn.minLvl = min_lvl || 0;
        pkmn.maxLvl = max_lvl || 35;
        pkmn.gender = gender || '*';
        pkmn.city = areas;
        const result = await pkmn.save();
        if (result) {
            // Success
            console.log('Pokemon subscription', id, 'updated successfully.');
        } else {
            showError(res, 'pokemon-edit', `Failed to update Pokemon subscription ${id}`);
            return;
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
        } else {
            showError(res, 'pokemon-delete', `Failed to delete Pokemon subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'pokemon-delete', `Failed to find Pokemon subscription ${id}`);
        return;
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
        } else {
            showError(res, 'pokemon-delete-all', `Failed to delete all Pokemon subscriptions for guild: ${guild_id} user: ${user_id}`);
            return;
        }
    } else {
        showError(res, 'pokemon-delete-all', 'Guild ID or User ID not set, failed to delete all pokemon subscriptions for user.');
        return;
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
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'pvp-new', `Failed to get user subscription for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    const areas = getAreas(guild_id, city);
    const sql = [];
    const split = pokemon.split(',');
    for (const pokemonId of split) {
        let exists = await PVP.getPokemonByLeague(guild_id, user_id, pokemonId, form, league);
        if (exists) {
            // Already exists
            exists.minRank = min_rank || 5;
            exists.minPercent = min_percent || 99;
            exists.city = utils.arrayUnique(exists.city.concat(areas));
        } else {
            exists = PVP.build({
                id: 0,
                subscriptionId: subscription.id,
                guildId: guild_id,
                userId: user_id,
                pokemonId: pokemonId,
                form: form,
                league: league,
                minRank: min_rank || 5,
                minPercent: min_percent || 99,
                city: areas,
            });
        }
        sql.push(exists.toJSON());
    }
    await PVP.create(sql);
    res.redirect('/pokemon#pvp');
});

router.post('/pvp/edit/:id', async (req, res) => {
    const id = req.params.id;
    const {
        guild_id,
        //pokemon,
        form,
        league,
        min_rank,
        min_percent,
        city
    } = req.body;
    //const user_id = defaultData.user_id;
    const exists = await PVP.getById(id);
    if (exists) {
        const areas = getAreas(guild_id, city);
        exists.form = form;
        exists.league = league;
        exists.minRank = min_rank || 25;
        exists.minPercent = min_percent || 98;
        exists.city = areas;
        const result = await exists.save();
        if (result) {
            // Success
            console.log('PVP subscription', id, 'updated successfully.');
        } else {
            showError(res, 'pvp-edit', `Failed to update PvP subscription ${id}`);
            return;
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
        } else {
            showError(res, 'pvp-delete', `Failed to delete PvP subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'pvp-delete', `Failed to find Pokemon subscription ${id}`);
        return;
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
        } else {
            showError(res, 'pvp-delete-all', `Failed to delete all PvP subscriptions for guild: ${guild_id} user: ${user_id}`);
            return;
        }
    } else {
        showError(res, 'pvp-delete-all', 'Guild ID or User ID not set, failed to delete all PVP subscriptions for user.');
        return;
    }
    res.redirect('/pokemon#pvp');
});


// Raid routes
router.post('/raids/new', async (req, res) => {
    const { guild_id, pokemon, form, city } = req.body;
    const user_id = defaultData.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'raid-new', `Failed to get user subscription for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    const areas = getAreas(guild_id, city);
    let sql = [];
    const split = pokemon.split(',');
    for (const pokemonId of split) {
        let exists = await Raid.getByPokemon(guild_id, user_id, pokemonId, form);
        if (!exists) {
            exists = Raid.build({
                id: 0,
                subscriptionId: subscription.id,
                guildId: guild_id,
                userId: user_id,
                pokemonId: pokemonId,
                form: form,
                city: areas,
            });
        } else {
            exists.city = utils.arrayUnique(exists.city.concat(areas));
        }
        sql.push(exists.toJSON());
    }
    await Raid.create(sql);
    res.redirect('/raids');
});

router.post('/raids/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, /*pokemon,*/ form, city } = req.body;
    //const user_id = defaultData.user_id;
    const exists = await Raid.getById(id);
    if (exists) {
        const areas = getAreas(guild_id, city);
        exists.form = form;
        exists.city = areas;
        const result = await exists.save();
        if (result) {
            // Success
            console.log('Raid subscription', id, 'updated successfully.');
        } else {
            showError(res, 'raid-edit', `Failed to update Raid subscription ${id}`);
            return;
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
        } else {
            console.error('Failed to delete Raid subscription', id);
            showError(res, 'raid-delete', `Failed to delete Raid subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'raid-delete', `Failed to find Raid subscription ${id}`);
        return;
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
        showError(res, 'raids-delete-all', 'Guild ID or User ID not set, failed to delete all raid subscriptions for user.');
        return;
    }
    res.redirect('/raids');
});


// Gym routes
router.post('/gyms/new', async (req, res) => {
    const { guild_id, name } = req.body;
    const user_id = defaultData.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'gym-new', `Failed to get user subscription for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    const exists = await Gym.getByName(guild_id, user_id, name);
    if (exists) {
        // Already exists
        console.log('Gym subscription with name', name, 'already exists');
        showError(res, 'gym-new', `Gym subscription with name ${name} already exists`);
    } else {
        const gym = Gym.build({
            id: 0,
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            name: name,
        });
        const result = await gym.save();
        if (result) {
            // Success
            console.log('Gym subscription for gym', name, 'created successfully.');
        } else {
            showError(res, 'gym-new', `Failed to create Gym subscription ${name}`);
            return;
        }
    }
    res.redirect('/raids#gyms');
});

router.post('/gyms/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Gym.getById(id);
    if (exists) {
        const result = await Gym.deleteById(id);
        if (result) {
            // Success
            console.log('Gym subscription with id', id, 'deleted successfully.');
        } else {
            showError(res, 'gym-delete', `Failed to delete Gym subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'gym-delete', `Failed to delete Gym subscription ${id}`);
        return;
    }
    res.redirect('/raids#gyms');
});

router.post('/gyms/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = defaultData.user_id;
    if (guild_id && user_id) {
        const result = await Gym.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            console.log('All Gym subscriptions deleted for guild:', guild_id, 'user:', user_id);
        } else {
            showError(res, 'gyms-delete-all', `Failed to delete all Gym subscriptions for guild: ${guild_id} and user: ${user_id}`);
            return;
        }
    } else {
        console.error('');
        showError(res, 'gyms-delete-all', 'Guild ID or User ID not set, failed to delete all gym subscriptions for user.');
        return;
    }
    res.redirect('/raids#gyms');
});


// Quest routes
router.post('/quests/new', async (req, res) => {
    const { guild_id, reward, city } = req.body;
    const user_id = defaultData.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'quest-new', `Failed to get user subscription for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    const areas = getAreas(guild_id, city);
    let exists = await Quest.getByReward(guild_id, user_id, reward);
    if (exists) {
        // Already exists
        exists.city = utils.arrayUnique(exists.city.concat(areas || []));
    } else {
        exists = Quest.build({
            id: 0,
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            reward: reward,
            city: areas,
        });
    }
    const results = await exists.save();
    if (results) {
        // Success
        console.log('Quest subscription for reward', reward, 'created successfully.');
    } else {
        showError(res, 'quest-new', `Failed to create or update Quest subscription reward ${reward}`);
        return;
    }
    res.redirect('/quests');
});

router.post('/quests/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, /*reward,*/ city } = req.body;
    //const user_id = defaultData.user_id;
    const quest = await Quest.getById(id);
    if (quest) {
        const areas = getAreas(guild_id, city);
        quest.city = areas;
        const result = await quest.save();
        if (result) {
            // Success
            console.log('Quest subscription', id, 'updated successfully.');
        } else {
            showError(res, 'quest-edit', `Failed to update Quest subscription ${id}`);
            return;
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
        } else {
            showError(res, 'quest-delete', `Failed to delete Quest subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'quest-delete', `Failed to find Quest subscription ${id}`);
        return;
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
        } else {
            showError(res, 'quest-delete-all', `Failed to delete all Quest subscriptions for guild: ${guild_id} user: ${user_id}`);
            return;
        }
    } else {
        showError(res, 'quests-delete-all', 'Guild ID or User ID not set, failed to delete all quest subscriptions for user.');
        return;
    }
    res.redirect('/quests');
});


// Invasion routes
router.post('/invasions/new', async (req, res) => {
    const { guild_id, pokemon, city } = req.body;
    const user_id = defaultData.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'invasions', `Failed to get user subscription for GuildId: ${guild_id} user: ${user_id}`);
        return;
    }
    const areas = getAreas(guild_id, city);
    const split = pokemon.split(',');
    for (let i = 0; i < split.length; i++) {
        const pokemonId = split[i];
        let exists = await Invasion.getByReward(guild_id, user_id, pokemonId);
        if (exists) {
            // Already exists
            exists.city = utils.arrayUnique(exists.city.concat(areas || []));
        } else {
            exists = Invasion.build({
                id: 0,
                subscriptionId: subscription.id,
                guildId: guild_id,
                userId: user_id,
                rewardPokemonId: pokemonId,
                city: areas,
            });
        }
        const results = await exists.save();
        if (results) {
            // Success
            console.log('Invasion subscription for reward', pokemonId, 'created successfully.');
        } else {
            showError(res, 'invasions', `Failed to create Invasion subscription for reward ${pokemonId}`);
            return;
        }
    }
    res.redirect('/invasions');
});

router.post('/invasions/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, /*reward,*/ city } = req.body;
    //const user_id = defaultData.user_id;
    const invasion = await Invasion.getById(id);
    if (invasion) {
        const areas = getAreas(guild_id, city);
        invasion.city = areas;
        const result = invasion.save();
        if (result) {
            // Success
            console.log('Invasion subscription', id, 'updated successfully.');
        } else {
            showError(res, 'invasions', `Failed to update Invasion subscription ${id}`);
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
        } else {
            showError(res, 'invasions', `Failed to delete Invasion subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'invasions', `Failed to find Invasion subscription ${id}`);
        return;
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
            console.log('All Invasion subscriptions deleted for guild:', guild_id, 'user:', user_id);
        } else {
            console.error('Failed to delete all Invasion subscriptions for guild:', guild_id, 'user_id:', user_id);
        }
    } else {
        showError(res, 'invasions', 'Guild ID or User ID not set, failed to delete all invasion subscriptions.');
        return;
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
        enabled,
        phone_number,
    } = req.body;
    const user_id = defaultData.user_id;
    const split = (location || '0,0').split(',');
    const lat = parseFloat(split[0]);
    const lon = parseFloat(split[1]);
    const isEnabled = enabled === 'on';
    const result = Subscription.updateSubscription(guild_id, user_id, isEnabled, distance, lat, lon, icon_style, phone_number);
    if (result) {
        // Success
        console.log('Successfully updated subscription settings for', user_id, 'in guild', guild_id);
    } else {
        showError(res, 'settings', 'Failed to update settings.');
        return;
    }
    res.redirect('/settings');
});

const isUltraRarePokemon = (pokemonId) => {
    const ultraRareList = [
        201, //Unown
        480, //Uxie
        481, //Mesprit
        482 //Azelf
    ];
    return ultraRareList.includes(pokemonId);
};

const getAreas = (guildId, city) => {
    let areas;
    if (city === 'All') {
        // All areas specified
        config.discord.guilds.map(x => {
            if (x.id === guildId) {
                areas = x.geofences;
            }
        });
    } else if (city === 'None') {
        // No areas specified
        areas = [];
    } else if (!Array.isArray(city)) {
        // Only one area specified, make array
        areas = [city];
    } else {
        // If all and none are both specified, all supersedes none or individual areas
        // or if all is specified, none is not, set all areas and disregard individual
        // areas that might be included
        if ((city.includes('All') && city.includes('None')) ||
            (city.includes('All') && !city.includes('None'))) {
            return getAreas(guildId, 'All');
        } else if (city.includes('None') && city.length > 1) {
            city = city.splice(city.indexOf('None'), 1);
        } else {
            // Only individual areas are provided
            areas = city;
        }
    }
    return areas || [];
};

const formatAreas = (guildId, subscriptionAreas) => {
    return utils.arraysEqual(subscriptionAreas, config.discord.guilds.filter(x => x.id === guildId)[0].geofences)
        ? 'All' // TODO: Localize
        : ellipsis(subscriptionAreas.join(','));
};

const ellipsis = (str) => {
    const value = str.substring(0, Math.min(64, str.length));
    return value === str ? value : value + '...';
}

const showError = (res, page, message) => {
    console.error(message);
    const errorData = { ...defaultData };
    errorData.error = message;
    errorData.show_error = true;
    res.render(page, errorData);
};

const showErrorJson = (res, guildId, message, otherData) => {
    res.json({
        data: {
            error: message,
            show_error: true,
            ...otherData,
        }
    });
};

module.exports = router;
