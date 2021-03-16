'use strict';

const Localizer = require('../services/locale.js');
const MapPokestop = require('../models/map/pokestop.js');
const config = require('../config.json');

const getPokemonNameIdsList = async () => {
    const pokemon = [];
    for (let i = 1; i < config.maxPokemonId; i++) {
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

const getQuestRewards = async () => {
    const quests = await MapPokestop.getAll();
    const rewards = [];
    for (const quest of quests) {
        const questRewards = JSON.parse(quest.questRewards);
        if (questRewards.length > 0) {
            const reward = Localizer.getQuestReward(questRewards[0]);
            if (reward && !rewards.includes(reward)) {
                rewards.push(reward);
            }
        }
    }
    rewards.sort();
    return rewards;
};

const getLureTypes = () => {
    return [
        { name: 'Normal' },
        { name: 'Glacial' },
        { name: 'Mossy' },
        { name: 'Magnetic' },
    ];
};

const getPokemonSizes = () => {
    return [
        { name: 'All', value: 0, },
        { name: 'Tiny', value: 1, },
        { name: 'Small', value: 2, },
        { name: 'Normal', value: 3, },
        { name: 'Large', value: 4, },
        { name: 'Big', value: 5, },
    ];
}

module.exports = {
    getPokemonNameIdsList,
    buildCityList,
    getQuestRewards,
    getLureTypes,
    getPokemonSizes,
};