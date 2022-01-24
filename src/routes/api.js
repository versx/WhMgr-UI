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
const Lure = require('../models/lure.js');
const Location = require('../models/location.js');
const { Subscription, NotificationStatusType, } = require('../models/subscription.js');
const DiscordClient = require('../services/discord.js');
const Localizer = require('../services/locale.js');
const {
    getAreas,
    arrayUnique,
    formatAreas,
    formatPokemonSize,
    showError,
    showErrorJson,
} = require('../services/utils.js');
const Metadata = require('../models/metadata');

/* eslint-disable no-case-declarations */
router.post('/server/:guild_id/user/:user_id', async (req, res) => {
    const { guild_id, user_id } = req.params;
    const formatted = (req.query.formatted || 'false') === 'true';
    const type = req.query.type;
    switch (type) {
        case 'subscriptions':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { subscriptions: { pokemon: 0, pvp: 0, raids: 0, gyms: 0, quests: 0, invasions: 0 }, clients_online: 0 });
                return;
            }
            const subscriptions = {
                pokemon: await Pokemon.getCount(guild_id, user_id),
                pvp: await PVP.getCount(guild_id, user_id),
                raids: await Raid.getCount(guild_id, user_id),
                quests: await Quest.getCount(guild_id, user_id),
                invasions: await Invasion.getCount(guild_id, user_id),
                gyms: await Gym.getCount(guild_id, user_id),
                lures: await Lure.getCount(guild_id, user_id),
                locations: await Location.getCount(guild_id, user_id),
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
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { pokemon: [] });
                return;
            }
            const pokemon = await Pokemon.getAll(guild_id, user_id);
            const pokemonData = [];
            if (pokemon) {
                for (let pkmn of pokemon) {
                    pkmn = pkmn.toJSON();
                    //if (pkmn.pokemonId === 'All') {
                    //    pkmn.name = `<img src='/img/pokemon.png' width='auto' height='32'>&nbsp;` + Localizer.getValue('All');
                    //} else {
                    const { icons, ids } = await groupPokemonIconUrls(pkmn.pokemonId);
                    pkmn.name = {
                        formatted: icons.join(' '),
                        sort: ids,
                    };
                    pkmn.form = pkmn.forms;
                    pkmn.cp = `${pkmn.minCp}-4096`;
                    pkmn.iv = pkmn.minIv;
                    pkmn.ivList = pkmn.ivList.length;
                    pkmn.lvl = `${pkmn.minLvl}-${pkmn.maxLvl}`;
                    pkmn.gender = pkmn.gender === '*'
                        ? 'All'
                        : pkmn.gender == 'm'
                            ? 'Male Only'
                            : 'Female Only';
                    pkmn.genderName = pkmn.gender === '*' ? 'All' : pkmn.gender;
                    pkmn.size = formatPokemonSize(pkmn.size);
                    pkmn.city = formatAreas(guild_id, pkmn.areas);
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
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { pvp: [] });
                return;
            }
            const pvp = await PVP.getAll(guild_id, user_id);
            const pvpData = [];
            if (pvp) {
                for (let pvpSub of pvp) {
                    pvpSub = pvpSub.toJSON();
                    const { icons, ids } = await groupPokemonIconUrls(pvpSub.pokemonId);
                    pvpSub.name = {
                        formatted: icons.join(' '),
                        sort: ids,
                    };
                    pvpSub.form = pvpSub.forms;
                    pvpSub.city = formatAreas(guild_id, pvpSub.areas);
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
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { raids: [] });
                return;
            }
            const raids = await Raid.getAll(guild_id, user_id);
            const raidData = [];
            if (raids) {
                for (let raid of raids) {
                    raid = raid.toJSON();
                    const { icons, ids } = await groupPokemonIconUrls(raid.pokemonId);
                    raid.name = {
                        formatted: icons.join(' '),
                        sort: ids,
                    };
                    raid.form = raid.forms;
                    raid.exEligible = raid.exEligible ? 'Yes' : 'No',
                    raid.city = formatAreas(guild_id, raid.areas);
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
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { gyms: [] });
                return;
            }
            const gyms = await Gym.getAll(guild_id, user_id);
            const gymData = [];
            if (gyms) {
                for (let gym of gyms) {
                    gym = gym.toJSON();
                    const images = [];
                    for (const id of gym.pokemonIds.sort()) {
                        images.push(`<img src='${await Localizer.getPokemonIcon(id)}' width='18' height='18'>`);
                    }
                    gym.pokemonIds = images.join(' ');
                    gym.exEligible = gym.exEligible ? 'Yes' : 'No',
                    gym.buttons = `
                    <a href='/gym/edit/${gym.id}'><button type='button'class='btn btn-sm btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/gym/delete/${gym.id}'><button type='button'class='btn btn-sm btn-danger'>Delete</button></a>
                    `;
                    gymData.push(gym);
                }
            }
            res.json({ data: { gyms: gymData } });
            break;
        case 'quests':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { quests: [] });
                return;
            }
            const quests = await Quest.getAll(guild_id, user_id);
            const questData = [];
            if (quests) {
                for (let quest of quests) {
                    quest = quest.toJSON();
                    quest.pokestop_name = quest.pokestopName;
                    quest.city = formatAreas(guild_id, quest.areas);
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
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { invasions: [] });
                return;
            }
            const invasions = await Invasion.getAll(guild_id, user_id);
            const invasionData = [];
            if (invasions) {
                for (let invasion of invasions) {
                    invasion = invasion.toJSON();
                    const { icons, ids } = await groupPokemonIconUrls(invasion.rewardPokemonId);
                    const gruntNames = groupInvasions(invasion.gruntType);
                    invasion.name = invasion.pokestopName;
                    invasion.reward = {
                        formatted: icons.join(' '),
                        sort: ids,
                    };
                    invasion.type = {
                        formatted: gruntNames.join(', '),
                        sort: gruntNames,
                    };
                    invasion.city = formatAreas(guild_id, invasion.areas);
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
        case 'lures':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { lures: [] });
                return;
            }
            const lures = await Lure.getAll(guild_id, user_id);
            const lureData = [];
            if (lures) {
                for (let lure of lures) {
                    lure = lure.toJSON();
                    const { icons, ids } = groupLuresIconUrls(lure.lureType);
                    lure.pokestop_name = lure.pokestopName;
                    lure.type = {
                        formatted: icons.join(' '),
                        sort: ids,
                    };
                    lure.city = formatAreas(guild_id, lure.areas);
                    lure.buttons = `
                    <a href='/lure/edit/${lure.id}'><button type='button'class='btn btn-sm btn-primary'>Edit</button></a>
                    &nbsp;
                    <a href='/lure/delete/${lure.id}'><button type='button'class='btn btn-sm btn-danger'>Delete</button></a>
                    `;
                    lureData.push(lure);
                }
            }
            res.json({ data: { lures: lureData } });
            break;
        case 'locations':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { lures: [] });
                return;
            }
            const subscription = await Subscription.getSubscription(guild_id, user_id);
            if (!subscription) {
                showErrorJson(res, guild_id, 'No subscription found');
                return;
            }
            const locations = await Location.getAll(guild_id, user_id);
            const locationData = [];
            if (locations) {
                for (let location of locations) {
                    location = location.toJSON();
                    if (formatted) {
                        location.location = `<a href="https://maps.google.com/maps?q=${location.latitude},${location.longitude}" target="_blank">${location.latitude},${location.longitude}</a>`;
                        location.active = location.name === subscription.location ? 'Yes' : 'No';
                        location.buttons = `
                        <a href='/location/edit/${location.id}'><button type='button'class='btn btn-sm btn-primary'>Edit</button></a>
                        &nbsp;
                        <a href='/location/delete/${location.id}'><button type='button'class='btn btn-sm btn-danger'>Delete</button></a>
                        `;
                    }
                    locationData.push(location);
                }
            }
            res.json({ data: { locations: locationData } });
            break;
        case 'roles':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { invasions: [] });
                return;
            }
            const roleIds = await DiscordClient.getAllRoles(guild_id, user_id);
            if (!roleIds) {
                // Error
                console.error('Failed to get roles for guild id', guild_id, 'and user id', user_id);
            }
            const results = [];
            for (let roleId of roleIds) {
                const name = await DiscordClient.getRoleNameById(guild_id, roleId);
                if (config.discord.guilds.find(x => x.geofences.includes(name))) {
                    results.push({
                        id: roleId,
                        name: name,
                        buttons: `<a href='/api/role/remove/${guild_id}/${roleId}' onclick="return confirm('Are you sure you want to remove role ${name}?');"><button type='button'class='btn btn-sm btn-danger'>Remove</button></a>`
                    });
                }
            }
            res.json({ data: { roles: results } });
            break;
        case 'settings':
            if (!guild_id || guild_id === null || guild_id === 'null') {
                showErrorJson(res, guild_id, 'Select a server from the dropdown menu before creating/editing/deleting any subscriptions!', { settings: [] });
                return;
            }
            const sub = await Subscription.getSubscription(guild_id, user_id);
            const settings = sub.toJSON();
            const guildConfig = config.discord.guilds.find(x => x.id === guild_id);
            if (!guildConfig) {
                // Failed to get guild map settings
                return null;
            }
            settings.start_lat = guildConfig.startLat;
            settings.start_lon = guildConfig.startLon;
            settings.start_zoom = guildConfig.startZoom;
            
            if (formatted) {
                const list = [];
                const keys = Object.keys(settings);
                const ignoreKeys = ['id', 'guildId', 'userId'];
                keys.forEach(key => {
                    if (!ignoreKeys.includes(key)) {
                        list.push({ 'name': key.toUpperCase(), 'value': settings[key] });
                    }
                });
                res.json({ data: { settings: list, } });
            } else {
                const locations = await Location.getAll(guild_id, user_id);
                settings.locations = locations.map(x => {
                    return {
                        name: x.name,
                        location: `${x.latitude},${x.longitude}`,
                        distance: x.distance,
                    };
                });
                // Get subscription statuses
                settings.enable_pokemon = sub.isEnabled(NotificationStatusType.Pokemon);
                settings.enable_pvp = sub.isEnabled(NotificationStatusType.PvP);
                settings.enable_raids = sub.isEnabled(NotificationStatusType.Raids);
                settings.enable_quests = sub.isEnabled(NotificationStatusType.Quests);
                settings.enable_invasions = sub.isEnabled(NotificationStatusType.Invasions);
                settings.enable_lures = sub.isEnabled(NotificationStatusType.Lures);
                settings.enable_gyms = sub.isEnabled(NotificationStatusType.Gyms);
                res.json({ data: { settings: settings, } });
            }
            break;
        case 'get_location':
            const locationName = req.query.name;
            const location = await Location.getByName(guild_id, user_id, locationName);
            res.json({
                data: {
                    location: location ? `${location.latitude},${location.longitude}` : null,
                    radius: location ? location.distance : 0,
                },
            });
            break;
        case 'get_map_settings':
            const guild = config.discord.guilds.find(x => x.id === guild_id);
            if (!guild) {
                // Failed to get guild map settings
                return null;
            }
            res.json({
                data: {
                    start_lat: guild.startLat,
                    start_lon: guild.startLon,
                    start_zoom: guild.startZoom,
                    min_zoom: config.map.minZoom,
                    max_zoom: config.map.maxZoom,
                    tileserver: config.map.tileserver,
                },
            });
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
        size,
        city,
        location,
    } = req.body;
    const user_id = req.session.user_id;
    const areas = city ? getAreas(guild_id, city.split(',')) : [];
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'pokemon/new', `Failed to get user subscription for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    const minIv = iv || 0;
    const ivList = iv_list ? iv_list.replace(/\r\n/g, ',').replace(/\n/g, ',').split(',') : [];
    const minLevel = min_lvl || 0;
    const maxLevel = max_lvl || 35;
    let exists = await Pokemon.getByPokemon(guild_id, user_id, pokemon, form, minIv, ivList, minLevel, maxLevel, gender, size);
    if (exists) {
        exists.minCp = 0;
        exists.minIv = minIv;
        exists.ivList = ivList;
        exists.minLvl = minLevel;
        exists.maxLvl = maxLevel;
        exists.gender = gender;
        exists.size = size;
        exists.areas = arrayUnique(exists.areas.concat(areas));
        exists.location = location || null;
    } else {
        const pokemonIDs = pokemon ? pokemon.replace(/\r\n/g, ',').replace(/\n/g, ',').split(',').map(x => +x) : [];
        exists = Pokemon.build({
            id: 0,
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            pokemonId: pokemonIDs,
            forms: (form || '').split(','),
            minCp: 0,
            minIv: /*isUltraRarePokemon(pokemonId) ? 0 :*/ iv || 0,
            ivList: ivList,
            minLvl: min_lvl || 0,
            maxLvl: max_lvl || 35,
            gender: gender || '*',
            size: size || 0,
            areas: areas,
            location: location || null,
        });
    }
    try {
        await exists.save();
        await updateLastModified();
    } catch (err) {
        console.error(err);
        showError(res, 'pokemon/new', `Failed to create Pokemon ${pokemon} subscriptions for guild: ${guild_id} user: ${user_id}`);
        return;
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
        iv_list,
        min_lvl,
        max_lvl,
        gender,
        size,
        city,
        location,
    } = req.body;
    //const user_id = req.session.user_id;
    const pkmn = await Pokemon.getById(id);
    const areas = city ? getAreas(guild_id, city.split(',')) : [];
    if (pkmn) {
        const ivList = iv_list ? iv_list.replace('\r', '').split('\n') : [];
        const pokemonIDs = pokemon ? pokemon.replace(/\r\n/g, ',').replace(/\n/g, ',').split(',').map(x => +x) : [];
        pkmn.pokemonId = pokemonIDs;
        pkmn.forms = (form || '').split(',');
        pkmn.minCp = 0;
        // If pokemon is rare (Unown, Azelf, etc), set IV value to 0
        pkmn.minIv = /*isUltraRarePokemon(pkmn.pokemonId) ? 0 :*/ iv || 0;
        pkmn.ivList = ivList;
        pkmn.minLvl = min_lvl || 0;
        pkmn.maxLvl = max_lvl || 35;
        pkmn.gender = gender || '*';
        pkmn.size = size || 0;
        pkmn.areas = areas;
        pkmn.location = location || null;
        const result = await pkmn.save();
        if (result) {
            // Success
            await updateLastModified();
            console.log('Pokemon subscription', id, 'updated successfully.');
        } else {
            showError(res, 'pokemon/edit', `Failed to update Pokemon subscription ${id}`);
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
            await updateLastModified();
            console.log('Pokemon subscription', id, 'deleted successfully.');
        } else {
            showError(res, 'pokemon/delete', `Failed to delete Pokemon subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'pokemon/delete', `Failed to find Pokemon subscription ${id}`);
        return;
    }
    res.redirect('/pokemon');
});

router.post('/pokemon/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = req.session.user_id;
    if (guild_id && user_id) {
        const result = await Pokemon.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('All Pokemon subscriptions deleted for guild:', guild_id, 'user:', user_id);
        } else {
            showError(res, 'pokemon/delete-all', `Failed to delete all Pokemon subscriptions for guild: ${guild_id} user: ${user_id}`);
            return;
        }
    } else {
        showError(res, 'pokemon/delete-all', 'Guild ID or User ID not set, failed to delete all pokemon subscriptions for user.');
        return;
    }
    res.redirect('/pokemon');
});


// PVP routes
router.post('/pvp/new', async (req, res) => {
    const {
        guild_id,
        //pokemon,
        form,
        league,
        min_rank,
        min_percent,
        city,
        location,
    } = req.body;
    const pokemon = toNumbers(req.body.pokemon);
    const user_id = req.session.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'pvp/new', `Failed to get user subscription for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    const areas = city ? getAreas(guild_id, city.split(',')) : [];
    let exists = await PVP.getPokemonByLeague(guild_id, user_id, pokemon, form, league);
    if (exists) {
        // Already exists
        exists.minRank = min_rank || 5;
        exists.minPercent = min_percent || 99;
        exists.areas = arrayUnique(exists.areas.concat(areas));
        exists.location = location || null;
    } else {
        const pokemonIDs = pokemon ? pokemon.replace(/\r\n/g, ',').replace(/\n/g, ',').split(',').map(x => +x) : [];
        exists = PVP.build({
            id: 0,
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            pokemonId: pokemonIDs,
            form: (form || '').split(','),
            league: league,
            minRank: min_rank || 5,
            minPercent: min_percent || 99,
            areas: areas,
            location: location || null,
        });
    }
    await exists.save();
    await updateLastModified();
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
        city,
        location,
    } = req.body;
    const pokemon = toNumbers(req.body.pokemon);
    //const user_id = req.session.user_id;
    const exists = await PVP.getById(id);
    if (exists) {
        const pokemonIDs = pokemon ? pokemon.replace(/\r\n/g, ',').replace(/\n/g, ',').split(',').map(x => +x) : [];
        const areas = city ? getAreas(guild_id, city.split(',')) : [];
        exists.pokemonId = pokemonIDs;
        exists.form = (form || '').split(',');
        exists.league = league;
        exists.minRank = min_rank || 25;
        exists.minPercent = min_percent || 98;
        exists.areas = areas;
        exists.location = location || null;
        const result = await exists.save();
        if (result) {
            // Success
            await updateLastModified();
            console.log('PVP subscription', id, 'updated successfully.');
        } else {
            showError(res, 'pvp/edit', `Failed to update PvP subscription ${id}`);
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
            await updateLastModified();
            console.log('PVP subscription with id', id, 'deleted successfully.');
        } else {
            showError(res, 'pvp/delete', `Failed to delete PvP subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'pvp/delete', `Failed to find Pokemon subscription ${id}`);
        return;
    }
    res.redirect('/pokemon#pvp');
});

router.post('/pvp/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = req.session.user_id;
    if (guild_id && user_id) {
        const result = await PVP.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('All PVP subscriptions deleted for guild:', guild_id, 'user:', user_id);
        } else {
            showError(res, 'pvp/delete-all', `Failed to delete all PvP subscriptions for guild: ${guild_id} user: ${user_id}`);
            return;
        }
    } else {
        showError(res, 'pvp/delete-all', 'Guild ID or User ID not set, failed to delete all PVP subscriptions for user.');
        return;
    }
    res.redirect('/pokemon#pvp');
});


// Raid routes
router.post('/raids/new', async (req, res) => {
    const { guild_id, pokemon, form, ex_eligible, city, location, } = req.body;
    const user_id = req.session.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'raids/new', `Failed to get user subscription ID for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    const areas = city ? getAreas(guild_id, city.split(',')) : [];
    const pokemonIDs = pokemon ? pokemon.replace(/\r\n/g, ',').replace(/\n/g, ',').split(',').map(x => +x) : [];
    let exists = await Raid.getByPokemon(guild_id, user_id, pokemon, form);
    if (exists) {
        // Raid subscription already exists
        exists.pokemonId = pokemonIDs;
        exists.form = (form || '').split(',');
        exists.exEligible = ex_eligible;
        exists.location = location;
        exists.areas = arrayUnique(exists.areas.concat(areas));
    } else {
        exists = Raid.build({
            id: 0,
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            pokemonId: pokemonIDs,
            form: (form || '').split(','),
            exEligible: ex_eligible === 'on',
            areas: areas,
            location: location || null,
        });
    }
    try {
        await exists.save();
        await updateLastModified();
    } catch (err) {
        console.error(err);
        showError(res, 'raids/new', `Failed to create Raid ${pokemon} subscriptions for guild: ${guild_id} user: ${user_id}`);
        return;
    }
    res.redirect('/raids');
});

router.post('/raids/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, pokemon, form, ex_eligible, city, location, } = req.body;
    //const user_id = req.session.user_id;
    const exists = await Raid.getById(id);
    if (exists) {
        const pokemonIDs = pokemon ? pokemon.replace(/\r\n/g, ',').replace(/\n/g, ',').split(',').map(x => +x) : [];
        const areas = city ? getAreas(guild_id, city.split(',')) : [];
        exists.pokemonId = pokemonIDs;
        exists.form = (form || '').split(',');
        exists.exEligible = ex_eligible === 'on',
        exists.areas = areas;
        exists.location = location || null;
        const result = await exists.save();
        if (result) {
            // Success
            await updateLastModified();
            console.log('Raid subscription', id, 'updated successfully.');
        } else {
            showError(res, 'raids/edit', `Failed to update Raid subscription ${id}`);
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
            await updateLastModified();
            console.log('Raid subscription with id', id, 'deleted successfully.');
        } else {
            console.error('Failed to delete Raid subscription', id);
            showError(res, 'raids/delete', `Failed to delete Raid subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'raids/delete', `Failed to find Raid subscription ${id}`);
        return;
    }
    res.redirect('/raids');
});

router.post('/raids/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = req.session.user_id;
    if (guild_id && user_id) {
        const result = await Raid.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('All raid subscriptions deleted for guild:', guild_id, 'user:', user_id);
        }
    } else {
        showError(res, 'raids/delete-all', 'Guild ID or User ID not set, failed to delete all raid subscriptions for user.');
        return;
    }
    res.redirect('/raids');
});


// Gym routes
router.post('/gyms/new', async (req, res) => {
    const { guild_id, name, min_level, max_level, pokemon, ex_eligible, location, } = req.body;
    const user_id = req.session.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'gyms/new', `Failed to get user subscription ID for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    // TODO: Validate gym name exists in scanner database
    const exists = await Gym.getByName(guild_id, user_id, name);
    if (exists) {
        // Already exists
        console.log('Gym subscription with name', name, 'already exists');
        showError(res, 'gyms/new', `Gym subscription with name ${name} already exists`);
    } else {
        const gym = Gym.build({
            id: 0,
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            name: name,
            minLevel: min_level,
            maxLevel: max_level,
            pokemonIds: (pokemon || '').split(','),
            exEligible: ex_eligible === 'on',
            location: location || null,
        });
        const result = await gym.save();
        if (result) {
            // Success
            await updateLastModified();
            console.log('Gym subscription for gym', name, 'created successfully.');
        } else {
            showError(res, 'gyms/new', `Failed to create Gym subscription ${name}`);
            return;
        }
    }
    res.redirect('/raids#gyms');
});

router.post('/gyms/edit/:id', async (req, res) => {
    const { guild_id, name, min_level, max_level, pokemon, ex_eligible, location, } = req.body;
    const user_id = req.session.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'gyms/edit', `Failed to get user subscription ID for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    // TODO: Validate gym name exists in scanner database
    const exists = await Gym.getByName(guild_id, user_id, name);
    if (!exists) {
        // Does not exist
        console.log('Gym subscription with name', name, 'does not exist');
        showError(res, 'gyms/edit', `Gym subscription with name ${name} does not exist`);
    } else {
        exists.minLevel = min_level;
        exists.maxLevel = max_level;
        exists.pokemonIds = (pokemon || '').split(',');
        exists.exEligible = ex_eligible === 'on',
        exists.location = location || null;
        const result = await exists.save();
        if (result) {
            // Success
            await updateLastModified();
            console.log('Gym subscription for gym', name, 'updated successfully.');
        } else {
            showError(res, 'gyms/edit', `Failed to update Gym subscription ${name}`);
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
            await updateLastModified();
            console.log('Gym subscription with id', id, 'deleted successfully.');
        } else {
            showError(res, 'gyms/delete', `Failed to delete Gym subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'gyms/delete', `Failed to delete Gym subscription ${id}`);
        return;
    }
    res.redirect('/raids#gyms');
});

router.post('/gyms/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = req.session.user_id;
    if (guild_id && user_id) {
        const result = await Gym.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('All Gym subscriptions deleted for guild:', guild_id, 'user:', user_id);
        } else {
            showError(res, 'gyms/delete-all', `Failed to delete all Gym subscriptions for guild: ${guild_id} and user: ${user_id}`);
            return;
        }
    } else {
        console.error('Guild ID or User ID are not set, failed to delete all gym subscriptions for user.');
        showError(res, 'gyms/delete-all', 'Guild ID or User ID are not set, failed to delete all gym subscriptions for user.');
        return;
    }
    res.redirect('/raids#gyms');
});


// Quest routes
router.post('/quests/new', async (req, res) => {
    const { guild_id, pokestop_name, reward, city, location, } = req.body;
    const user_id = req.session.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'quests/new', `Failed to get user subscription ID for GuildId: ${guild_id} and UserId: ${user_id}`);
        return;
    }
    const areas = city ? getAreas(guild_id, city.split(',')) : [];
    let exists = await Quest.getBy(guild_id, user_id, pokestop_name, reward);
    if (exists) {
        // Already exists
        exists.areas = arrayUnique(exists.areas.concat(areas || []));
    } else {
        exists = Quest.build({
            id: 0,
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            pokestopName: pokestop_name,
            reward: reward,
            areas: areas,
            location: location || null,
        });
    }
    const results = await exists.save();
    if (results) {
        // Success
        await updateLastModified();
        console.log('Quest subscription for reward', reward, 'at pokestop', pokestop_name, 'created successfully.');
    } else {
        showError(res, 'quest-new', `Failed to create or update Quest subscription reward ${reward} and pokestop ${pokestop_name}`);
        return;
    }
    res.redirect('/quests');
});

router.post('/quests/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, /*reward,*/ pokestop_name, city, location, } = req.body;
    //const user_id = req.session.user_id;
    const quest = await Quest.getById(id);
    if (quest) {
        const areas = city ? getAreas(guild_id, city.split(',')) : [];
        //quest.reward = reward;
        quest.pokestopName = pokestop_name;
        quest.areas = areas;
        quest.location = location || null;
        const result = await quest.save();
        if (result) {
            // Success
            await updateLastModified();
            console.log('Quest subscription', id, 'updated successfully.');
        } else {
            showError(res, 'quests/edit', `Failed to update Quest subscription ${id}`);
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
            await updateLastModified();
            console.log('Quest subscription with id', id, 'deleted successfully.');
        } else {
            showError(res, 'quests/delete', `Failed to delete Quest subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'quests/delete', `Failed to find Quest subscription ${id}`);
        return;
    }
    res.redirect('/quests');
});

router.post('/quests/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = req.session.user_id;
    if (guild_id && user_id) {
        const result = await Quest.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('All quest subscriptions deleted for guild:', guild_id, 'user:', user_id);
        } else {
            showError(res, 'quests/delete-all', `Failed to delete all Quest subscriptions for guild: ${guild_id} user: ${user_id}`);
            return;
        }
    } else {
        showError(res, 'quests/delete-all', 'Guild ID or User ID not set, failed to delete all quest subscriptions for user.');
        return;
    }
    res.redirect('/quests');
});


// Invasion routes
router.post('/invasion/new', async (req, res) => {
    const { guild_id, name, pokemon, grunt_type, city, location, } = req.body;
    const user_id = req.session.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'invasions', `Failed to get user subscription ID for GuildId: ${guild_id} user: ${user_id}`);
        return;
    }
    const areas = city ? getAreas(guild_id, city.split(',')) : [];
    let exists = await Invasion.getBy(guild_id, user_id, name, grunt_type, pokemon);
    const pokemonIDs = pokemon ? pokemon.replace(/\r\n/g, ',').replace(/\n/g, ',').split(',').map(x => +x) : [];
    const gruntTypeIds = grunt_type ? grunt_type.map(x => +x) : [];
    if (exists) {
        // Already exists
        exists.pokestopName = name || null;
        exists.gruntType = gruntTypeIds;
        exists.rewardPokemonId = pokemonIDs;
        exists.areas = arrayUnique(exists.areas.concat(areas || []));
        exists.location = location || null;
    } else {
        exists = Invasion.build({
            id: 0,
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            pokestopName: name || null,
            gruntType: gruntTypeIds,
            rewardPokemonId: pokemonIDs,
            areas: areas,
            location: location || null,
        });
    }
    if (await exists.save()) {
        // Success
        await updateLastModified();
        console.log('Invasion subscription for reward', pokemon, 'created successfully.');
    } else {
        showError(res, 'invasions/invasions', `Failed to create Invasion subscription for reward ${pokemon}`);
        return;
    }
    res.redirect('/invasions');
});

router.post('/invasions/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, name, pokemon, grunt_type, city, location, } = req.body;
    //const user_id = req.session.user_id;
    const invasion = await Invasion.getById(id);
    if (invasion) {
        const pokemonIDs = pokemon ? pokemon.replace(/\r\n/g, ',').replace(/\n/g, ',').split(',').map(x => +x) : [];
        const gruntTypeIds = grunt_type ? grunt_type.map(x => +x) : [];
        const areas = city ? getAreas(guild_id, city.split(',')) : [];
        invasion.name = name;
        invasion.rewardPokemonId = pokemonIDs;
        invasion.gruntType = gruntTypeIds;
        invasion.areas = areas;
        invasion.location = location || null;
        const result = await invasion.save();
        if (result) {
            // Success
            await updateLastModified();
            console.log('Invasion subscription', id, 'updated successfully.');
        } else {
            showError(res, 'invasions/invasions', `Failed to update Invasion subscription ${id}`);
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
            await updateLastModified();
            console.log('Invasion subscription with id', id, 'deleted successfully.');
        } else {
            showError(res, 'invasions/invasions', `Failed to delete Invasion subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'invasions/invasions', `Failed to find Invasion subscription ${id}`);
        return;
    }
    res.redirect('/invasions');
});

router.post('/invasions/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = req.session.user_id;
    if (guild_id && user_id) {
        const result = await Invasion.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('All Invasion subscriptions deleted for guild:', guild_id, 'user:', user_id);
        } else {
            console.error('Failed to delete all Invasion subscriptions for guild:', guild_id, 'user_id:', user_id);
        }
    } else {
        showError(res, 'invasions/invasions', 'Guild ID or User ID not set, failed to delete all invasion subscriptions.');
        return;
    }
    res.redirect('/invasions');
});


// Lure routes
router.post('/lures/new', async (req, res) => {
    const { guild_id, pokestop_name, city, location, } = req.body;
    let lureTypes = req.body.lure_types;
    const user_id = defaultData.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'invasions/invasions', `Failed to get user subscription ID for GuildId: ${guild_id} user: ${user_id}`);
        return;
    }
    if (!Array.isArray(lureTypes)) {
        lureTypes = [lureTypes];
    }
    const lureTypeIds = lureTypes ? lureTypes.map(x => +x) : [];
    const areas = city ? getAreas(guild_id, city.split(',')) : [];
    let exists = await Lure.getBy(guild_id, user_id, pokestop_name, lureTypeIds);
    if (exists) {
        // Already exists
        exists.pokestopName = pokestop_name;
        exists.areas = arrayUnique(exists.city.concat(areas || []));
        exists.location = location || null;
    } else {
        exists = Lure.build({
            id: 0,
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            pokestopName: pokestop_name,
            lureType: lureTypeIds,
            areas: areas,
            location: location || null,
        });
    }
    const results = await exists.save();
    if (results) {
        // Success
        await updateLastModified();
        console.log('Lure subscription for type', lureTypes, 'with pokestop', pokestop_name, 'created successfully.');
    } else {
        showError(res, 'lures', `Failed to create Lure subscription for type ${lureType} with pokestop ${pokestop_name}`);
        return;
    }
    res.redirect('/lures');
});

router.post('/lures/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { guild_id, pokestop_name, city, location, } = req.body;
    let lureTypes = req.body.lure_types;
    if (!Array.isArray(lureTypes)) {
        lureTypes = [lureTypes];
    }
    //const user_id = defaultData.user_id;
    const lure = await Lure.getById(id);
    if (lure) {
        const lureTypeIds = lureTypes ? lureTypes.map(x => +x) : [];
        const areas = city ? getAreas(guild_id, city.split(',')) : [];
        lure.pokestopName = pokestop_name;
        lure.lureType = lureTypeIds;
        lure.areas = areas;
        lure.location = location || null;
        const result = await lure.save();
        if (result) {
            // Success
            await updateLastModified();
            console.log('Lure subscription', id, 'updated successfully.');
        } else {
            showError(res, 'lures/lures', `Failed to update Lure subscription ${id}`);
        }
    }
    res.redirect('/lures');
});

router.post('/lures/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Lure.getById(id);
    if (exists) {
        const result = await Lure.deleteById(id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('Lure subscription with id', id, 'deleted successfully.');
        } else {
            showError(res, 'lures/lures', `Failed to delete Lure subscription ${id}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'lures/lures', `Failed to find Lure subscription ${id}`);
        return;
    }
    res.redirect('/lures');
});

router.post('/lures/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = defaultData.user_id;
    if (guild_id && user_id) {
        const result = await Lure.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('All Lure subscriptions deleted for guild:', guild_id, 'user:', user_id);
        } else {
            console.error('Failed to delete all Lure subscriptions for guild:', guild_id, 'user_id:', user_id);
        }
    } else {
        showError(res, 'lures/lures', 'Guild ID or User ID not set, failed to delete all lure subscriptions.');
        return;
    }
    res.redirect('/lures');
});


// Location routes
router.post('/location/new', async (req, res) => {
    const { guild_id, name, distance, location, } = req.body;
    const user_id = defaultData.user_id;
    const subscription = await Subscription.getSubscription(guild_id, user_id);
    if (!subscription) {
        showError(res, 'locations/locations', `Failed to get user subscription ID for GuildId: ${guild_id} user: ${user_id}`);
        return;
    }
    let exists = await Location.getByName(guild_id, user_id, name);
    const split = location.split(',');
    if (!exists) {
        exists = Location.build({
            subscriptionId: subscription.id,
            guildId: guild_id,
            userId: user_id,
            name: name,
            distance: distance,
            latitude: split[0],
            longitude: split[1],
        });
    } else {
        exists.name = name;
        exists.distance = distance;
        exists.latitude = split[0];
        exists.longitude = split[1];
    }
    const results = await exists.save();
    if (results) {
        // Success
        await updateLastModified();
        console.log('Location ', name, ' with distance', distance, 'and location', location, 'created successfully.');
    } else {
        showError(res, 'locations/locations', `Failed to create Location subscription for ${name}`);
        return;
    }
    res.redirect('/locations');
});

router.post('/location/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { name, location, distance, } = req.body;
    const loc = await Location.getById(id);
    if (loc) {
        const split = location.split(',');
        if (split.length !== 2) {
            // TODO: Failed to parse selected location
            return;
        }
        loc.name = name;
        loc.distance = distance;
        loc.latitude = split[0];
        loc.longitude = split[1];
        const result = await loc.save();
        if (result) {
            // Success
            await updateLastModified();
            console.log('Location subscription', id, 'updated successfully.');
        } else {
            showError(res, 'locations/locations', `Failed to update Location subscription ${id}`);
        }
    }
    res.redirect('/locations');
});

router.post('/locations/delete/:id', async (req, res) => {
    const id = req.params.id;
    const exists = await Location.getById(id);
    if (exists) {
        const result = await Location.deleteById(id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('Location with name', exists.name, 'deleted successfully.');
        } else {
            showError(res, 'locations/locations', `Failed to delete location ${exists.name}`);
            return;
        }
    } else {
        // Does not exist
        showError(res, 'locations/locations', `Failed to find location ${id}`);
        return;
    }
    res.redirect('/locations');
});

router.post('/locations/delete_all', async (req, res) => {
    const { guild_id } = req.body;
    const user_id = defaultData.user_id;
    if (guild_id && user_id) {
        const result = await Location.deleteAll(guild_id, user_id);
        if (result) {
            // Success
            await updateLastModified();
            console.log('All locations deleted for guild:', guild_id, 'user:', user_id);
        } else {
            console.error('Failed to delete all locations for guild:', guild_id, 'user_id:', user_id);
        }
    } else {
        showError(res, 'locations/locations', 'Guild ID or User ID not set, failed to delete all locations.');
        return;
    }
    res.redirect('/locations');
});


// Role assignment/unassignment routes
if (config.enableGeofenceRoles) {
    router.post('/role/add', async (req, res) => {
        const { guild_id, roles } = req.body;
        const user_id = req.session.user_id;
        const areas = getAreas(guild_id, roles);
        let error = false;
        for (const area of areas) {
            const result = await DiscordClient.addRole(guild_id, user_id, area);
            if (!result) {
                console.error('Failed to assign city role', area, 'to guild', guild_id, 'user', user_id);
                error = true;
            }
        }
        if (error) {
            showError(res, 'role-add', `Failed to assign city role(s) to guild ${guild_id} user ${user_id}`);
            return;
        }
        res.redirect('/roles');
    });

    router.get('/role/remove/:guild_id/:id', async (req, res) => {
        const { id, guild_id} = req.params;
        const userId = req.session.user_id;
        const result = await DiscordClient.removeRole(guild_id, userId, id);
        if (!result) {
            // Failed to remove city role
            showError(res, 'role-remove', `Failed to remove city role with id ${id} from guild ${guild_id} user ${userId}`);
            return;
        }
        res.redirect('/roles');
    });

    router.post('/roles/remove_all', async (req, res) => {
        const { guild_id } = req.body;
        const userId = req.session.user_id;
        const guild = config.discord.guilds.find(x => x.id === guild_id);
        if (!guild) {
            // Failed to find guild
            showError(res, 'roles-remove-all', `Failed to find guild ${guild_id} to remove all city roles for user ${userId}`);
            return;
        }
        const roles = guild.geofences;
        const result = await DiscordClient.removeAllRoles(guild_id, userId, roles);
        if (!result) {
            // Failed to remove all city roles
            showError(res, 'roles-remove-all', `Failed to remove all city roles from guild ${guild_id} user ${userId}`);
            return;
        }
        res.redirect('/roles');
    });
}


// Settings routes
router.post('/settings', async (req, res) => {
    const {
        guild_id,
        icon_style,
        location,
        phone_number,
        enable_pokemon,
        enable_pvp,
        enable_raids,
        enable_quests,
        enable_invasions,
        enable_lures,
        enable_gyms,
    } = req.body;
    const userId = req.session.user_id;
    let status = NotificationStatusType.None;
    const sub = await Subscription.getSubscription(guild_id, userId);
    if (enable_pokemon === 'on') {
        sub.enableNotificationType(NotificationStatusType.Pokemon);
    } else {
        sub.disableNotificationType(NotificationStatusType.Pokemon);
    }
    if (enable_pvp === 'on') {
        sub.enableNotificationType(NotificationStatusType.PvP);
    } else {
        sub.disableNotificationType(NotificationStatusType.PvP);
    }
    if (enable_raids === 'on') {
        sub.enableNotificationType(NotificationStatusType.Raids);
    } else {
        sub.disableNotificationType(NotificationStatusType.Raids);
    }
    if (enable_quests === 'on') {
        sub.enableNotificationType(NotificationStatusType.Quests);
    } else {
        sub.disableNotificationType(NotificationStatusType.Quests);
    }
    if (enable_invasions === 'on') {
        sub.enableNotificationType(NotificationStatusType.Invasions);
    } else {
        sub.disableNotificationType(NotificationStatusType.Invasions);
    }
    if (enable_lures === 'on') {
        sub.enableNotificationType(NotificationStatusType.Lures);
    } else {
        sub.disableNotificationType(NotificationStatusType.Lures);
    }
    if (enable_gyms === 'on') {
        sub.enableNotificationType(NotificationStatusType.Gyms);
    } else {
        sub.disableNotificationType(NotificationStatusType.Gyms);
    }
    status = sub.status;
    const result = await Subscription.updateSubscription(guild_id, userId, status, location, icon_style, phone_number);
    if (result) {
        // Success
        await updateLastModified();
        console.log('Successfully updated subscription settings for', userId, 'in guild', guild_id);
    } else {
        showError(res, 'settings', 'Failed to update settings.');
        return;
    }
    res.redirect('/settings');
});


const updateLastModified = async () => await Metadata.update('LAST_MODIFIED', Date.now() / 1000);

const groupPokemonIconUrls = async (pokemonIDs) => {
    const ids = (pokemonIDs || []).sort((a, b) => a - b);
    const icons = [];
    const maxIcons = 7;
    if (ids.length === 1) {
        const id = ids[0];
        const name = Localizer.getPokemonName(id);
        const icon = await Localizer.getPokemonIcon(id);
        const url = `<img src='${icon}' width='auto' height='32'>&nbsp;${name}`;
        icons.push(url);
    } else  {
        for (const [index, id] of ids.entries()) {
            const icon = await Localizer.getPokemonIcon(id);
            const url = `<img src='${icon}' width='auto' height='32'>&nbsp;`;
            icons.push(url);
            if (index > maxIcons - 1) {
                icons.push('<span><small style="color: grey;">& ' + (ids.length - maxIcons + 1) + ' more...</small></span>');
                break;
            }
        }
    }
    return { icons, ids, };
};

const groupInvasions = (gruntTypes) => {
    const names = [];
    const maxItems = 3;
    if (gruntTypes.length === 1) {
        const gruntType = gruntTypes[0];
        const name = Localizer.getInvasionName(gruntType);
        names.push(name);
    } else {
        for (const [index, gruntType] of gruntTypes.entries()) {
            const name = Localizer.getInvasionName(gruntType);
            names.push(name);
            if (index > maxItems - 1) {
                names.push('<span><small style="color: grey;">& ' + (gruntTypes.length - maxItems + 1) + ' more...</small></span>');
                break;
            }
        }
    }
    return names;
};

const groupLuresIconUrls = (lureTypes) => {
    const ids = (lureTypes || []).sort((a, b) => a - b);
    const icons = [];
    const maxIcons = 3;
    if (ids.length === 1) {
        const id = ids[0];
        const name = Localizer.getLureName(id);
        const icon = Localizer.getLureIcon(id);
        const url = `<img src='${icon}' width='auto' height='32'>&nbsp;${name}`;
        icons.push(url);
    } else  {
        for (const [index, id] of ids.entries()) {
            const icon = Localizer.getLureIcon(id);
            const url = `<img src='${icon}' width='auto' height='32'>&nbsp;`;
            icons.push(url);
            if (index > maxIcons - 1) {
                icons.push('<span><small style="color: grey;">& ' + (ids.length - maxIcons + 1) + ' more...</small></span>');
                break;
            }
        }
    }
    return { icons, ids, };
};

module.exports = router;