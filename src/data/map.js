'use strict';

const grunttypes = require('../../static/data/grunttype.json');
const pokedex = require('../../static/data/pokedex.json');

function getPokemonNameIdsList() {
    const dex = pokedex;
    const result = Object.keys(dex).map(x => { return { 'id': x, 'name': pokedex[x] }; });
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
                    'name': pokedex[pokemonId]
                });
            }
            if (grunt.second_reward) {
                if (grunt.encounters.second && grunt.encounters.second.length > 0) {
                    const encounter = grunt.encounters.second[0];
                    const pokemonId = parseInt(encounter.split('_')[0]);
                    rewards.push({
                        'pokemon_id': pokemonId,
                        'name': pokedex[pokemonId]
                    });
                }
            }
        }
    }
    return rewards;
}

module.exports = {
    getPokemonNameIdsList,
    getGruntRewardIdsList
};