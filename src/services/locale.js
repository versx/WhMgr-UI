'use strict';

const axios = require('axios');
const fs = require('fs');
const i18n = require('i18n');
const path = require('path');
const util = require('util');

const config = require('../config.json');

i18n.configure({
    autoReload: true,
    directory: path.resolve(__dirname, '../../static/locales'),
    defaultLocale: 'en',
    locales: ['en', 'de', 'es'],          
});
i18n.setLocale('en');

class Localizer {
    static instance = new Localizer();

    constructor() {
        this.availablePokemon = (async () => {
            if (config.urls.images.pokemon.includes('http')) {
                // Remote repo
                const response = await axios.get(config.urls.images.pokemon + '/index.json');
                return new Set(response.data);
            } else {
                // Locale repo
                const pokemonIconsDir = path.resolve(__dirname, '../../static/' + config.urls.images.pokemon);
                const files = await fs.promises.readdir(pokemonIconsDir);
                if (files) {
                    const availableForms = [];
                    files.forEach(file => {
                        const match = /^(.+)\.png$/.exec(file);
                        if (match !== null) {
                            availableForms.push(match[1]);
                        }
                    });
                    return new Set(availableForms);
                }
            }
        })();
    }

    getPokemonName(pokemonId) {
        return i18n.__('poke_' + pokemonId);
    }

    /* eslint-enable no-unused-vars */
    async getPokemonIcon(pokemonId, form = 0, evolution = 0, gender = 0, costume = 0, shiny = false) {
        return `${config.urls.images.pokemon}/${await this.resolvePokemonIcon(pokemonId, form, evolution, gender, costume, shiny)}.png`;
    }

    async getRaidIcon(pokemonId, raidLevel, form, evolution, gender, costume) {
        if (pokemonId > 0) {
            return await this.getPokemonIcon(pokemonId, form, evolution, gender, costume);
        }
        return util.format(config.urls.images.eggs, raidLevel);
    }

    async resolvePokemonIcon(pokemonId, form = 0, evolution = 0, gender = 0, costume = 0, shiny = false) {
        const evolutionSuffixes = evolution ? ['-e' + evolution, ''] : [''];
        const formSuffixes = form ? ['-f' + form, ''] : [''];
        const costumeSuffixes = costume ? ['-c' + costume, ''] : [''];
        const genderSuffixes = gender ? ['-g' + gender, ''] : [''];
        const shinySuffixes = shiny ? ['-shiny', ''] : [''];
        const lookup = await this.availablePokemon;
        for (const evolutionSuffix of evolutionSuffixes) {
            for (const formSuffix of formSuffixes) {
                for (const costumeSuffix of costumeSuffixes) {
                    for (const genderSuffix of genderSuffixes) {
                        for (const shinySuffix of shinySuffixes) {
                            const result = `${pokemonId}${evolutionSuffix}${formSuffix}${costumeSuffix}${genderSuffix}${shinySuffix}`;
                            if (lookup.has(result)) return result;
                        }
                    }
                }
            }
        }
        return '0'; // substitute
    }
}

module.exports = Localizer;
