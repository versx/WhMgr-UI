'use strict';

const utils = require('../services/utils.js');
const grunttypes = require('../../static/data/grunttype.json');
const pokedex = require('../../static/data/pokedex.json');

function getPokemonNameIdsList() {
    const dex = pokedex;
    const result = Object.keys(dex).map(x => { return { 'id': x, 'id_3': (x + '').padStart(3, '0'), 'name': pokedex[x], 'image_url': utils.getPokemonIcon(x, 0) }; });
    return result;
}

function getGruntRewardIdsList() {
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
                rewards.push({
                    'pokemon_id': pokemonId,
                    'pokemon_id_3': (pokemonId + '').padStart(3, '0'),
                    'name': pokedex[pokemonId],
                    'image_url': utils.getPokemonIcon(pokemonId, 0)
                });
            }
            if (grunt.second_reward) {
                if (grunt.encounters.second && grunt.encounters.second.length > 0) {
                    const encounter = grunt.encounters.second[0];
                    const pokemonId = parseInt(encounter.split('_')[0]);
                    rewards.push({
                        'pokemon_id': pokemonId,
                        'pokemon_id_3': (pokemonId + '').padStart(3, '0'),
                        'name': pokedex[pokemonId],
                        'image_url': utils.getPokemonIcon(pokemonId, 0)
                    });
                }
            }
        }
    }
    rewards.sort((x, y) => x.pokemon_id - y.pokemon_id);
    return rewards;
}

module.exports = {
    getPokemonNameIdsList,
    getGruntRewardIdsList
};