'use strict';

const locale = require('../services/locale.js');
const utils = require('../services/utils.js');
const GeofenceService = require('../services/geofence.js');

const svc = new GeofenceService.GeofenceService();
const config = require('../config.json');
const grunttypes = require('../../static/data/grunttype.json');

const getPokemonNameIdsList = () => {
    let pokemon = [];
    for (let i = 1; i < config.maxPokemonId; i++) {
        pokemon.push({
            'id': i,
            'id_3': (i + '').padStart(3, '0'),
            'name': locale.getPokemonName(i),
            'image_url': utils.getPokemonIcon(i, 0)
        });
    }
    return pokemon;
};

const getGruntRewardIdsList = () => {
    const grunts = grunttypes;
    const rewards = [];
    const keys = Object.keys(grunts);
    for (let i = 0; i < keys.length; i++) {
        const gruntId = keys[i];
        const grunt = grunts[gruntId];
        if (grunt.encounters) {
            if (grunt.encounters.first && grunt.encounters.first.length > 0) {
                const encounter = grunt.encounters.first[0];
                const pokemonId = parseInt(encounter.split('_')[0]);
                const exists = rewards.filter(x => x.pokemon_id === pokemonId);
                if (exists.length > 0) {
                    continue;
                }
                rewards.push({
                    'pokemon_id': pokemonId,
                    'pokemon_id_3': (pokemonId + '').padStart(3, '0'),
                    'name': locale.getPokemonName(pokemonId),
                    'image_url': utils.getPokemonIcon(pokemonId, 0)
                });
            }
            if (grunt.second_reward) {
                if (grunt.encounters.second && grunt.encounters.second.length > 0) {
                    const encounter = grunt.encounters.second[0];
                    const pokemonId = parseInt(encounter.split('_')[0]);
                    const exists = rewards.filter(x => x.pokemon_id === pokemonId);
                    if (exists.length > 0) {
                        continue;
                    }
                    rewards.push({
                        'pokemon_id': pokemonId,
                        'pokemon_id_3': (pokemonId + '').padStart(3, '0'),
                        'name': locale.getPokemonName(pokemonId),
                        'image_url': utils.getPokemonIcon(pokemonId, 0)
                    });
                }
            }
        }
    }
    rewards.sort((x, y) => x.pokemon_id - y.pokemon_id);
    return rewards;
};

const buildCityList = (guilds) => {
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
};

module.exports = {
    getPokemonNameIdsList,
    getGruntRewardIdsList,
    buildCityList
};