'use strict';

//const fs = require('fs');
//const path = require('path');

const Localizer = require('../services/locale.js');
const Location = require('../models/location.js');
const MapPokestop = require('../models/map/pokestop.js');
const config = require('../config.json');
const masterfile = require('../../static/data/masterfile.json');

const getPokemonNameIdsList = async () => {
    const pokemon = [];
    for (let i = 1; i <= config.maxPokemonId; i++) {
        const pkmnIcon = await Localizer.getPokemonIcon(i);
        pokemon.push({
            'id': i,
            'id_3': (i + '').padStart(3, '0'),
            'name': Localizer.getPokemonName(i),
            'image_url': pkmnIcon,
        });
    }
    return pokemon;
};

const buildCityList = (guilds) => {
    const cities = [];
    const configGuilds = config.discord.guilds;
    for (let i = 0; i < configGuilds.length; i++) {
        const configGuild = configGuilds[i];
        if (guilds.includes(configGuild.id)) {
            configGuild.geofences.forEach(geofence => cities.push({
                'name': geofence,
                'guild': configGuild.id,
            }));
        }
    }
    return cities;
};

const buildLocationsList = async (guilds, userId) => {
    const locs = [];
    const locations = await Location.getAllByUserId(userId);
    for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        if (guilds.includes(location.guildId)) {
            locs.push({
                'name': location.name,
                'guild': location.guildId,
            });
        }
    }
    return locs;
};

const getQuestRewards = async () => {
    const quests = await MapPokestop.getAll();
    const rewards = [];
    for (const quest of quests) {
        const questRewards = JSON.parse(quest.questRewards);
        if (questRewards.length > 0) {
            const questReward = questRewards[0];
            if (questReward && !rewards.includes(questReward)) {
                rewards.push(questReward);
            }
        }
    }
    rewards.sort();
    return rewards;
};

const getQuestRewardKeywords = async () => {
    const rewards = await getQuestRewards();
    const keywords = [];
    for (const reward of rewards) {
        const keyword = Localizer.getQuestReward(reward);
        if (keyword && !rewards.includes(keyword)) {
            rewards.push(keyword);
        }
    }
    return keywords;
};

const getQuestRewardItems = async () => {
    const items = masterfile.items;
    const list = [];
    const keys = Object.keys(items);
    for (const itemId of keys) {
        const item = items[itemId];
        list.push({
            ...item,
            id: itemId,
        });
    }
    return list;
};

const getInvasionTypes = () => {
    const types = [];
    for (let i = 0; i <= 50; i++) {
        const name = Localizer.getInvasionName(i);
        types.push({ id: i, name });
    }
    return types;
};

const getLureTypes = () => {
    return [
        { id: 501, name: 'Normal' },
        { id: 502, name: 'Glacial' },
        { id: 503, name: 'Mossy' },
        { id: 504, name: 'Magnetic' },
        { id: 505, name: 'Rainy' },
    ];
};

module.exports = {
    getPokemonNameIdsList,
    buildCityList,
    buildLocationsList,
    getQuestRewards,
    getQuestRewardKeywords,
    getQuestRewardItems,
    getInvasionTypes,
    getLureTypes,
};