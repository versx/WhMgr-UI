'use strict';

const axios = require('axios');
const fs = require('fs');
const i18n = require('i18n');
const path = require('path');

const config = require('../config.json');

i18n.configure({
    autoReload: true,
    directory: path.resolve(__dirname, '../../static/locales'),
    defaultLocale: 'en',
    extension: '.json',
    locales: ['en', 'de', 'es'],          
});
i18n.setLocale('en');

class Localizer {
    //static instance = new Localizer();

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

    getValue(key) {
        return i18n.__(key);
    }

    getPokemonName(pokemonId) {
        const name = i18n.__('poke_' + pokemonId);
        return name;
    }

    getLureName(lureType) {
        const value = i18n.__('lure_' + lureType);
        return value;
    }

    getLureIcon(lureTypeId) {
        return `../../img/lures/${lureTypeId}.png`;
    }

    getInvasionName(gruntType) {
        const name = i18n.__('grunt_' + gruntType);
        return name;
    }

    getItemName(itemId) {
        return i18n.__('item_' + itemId);
    }

    getFormNames() {
        const locales = i18n.getCatalog(config.locale);
        const forms = [];
        for (const locale in locales) {
            const formName = locales[locale];
            if (formName && locale.includes('form_') && !forms.includes(formName)) {
                forms.push(formName);
            }
        }
        return forms;
    }

    getCostumeNames() {
        const locales = i18n.getCatalog(config.locale);
        const costumes = [];
        for (const locale in locales) {
            const costumeName = locales[locale];
            if (costumeName && locale.includes('costume_') && !costumes.includes(costumeName)) {
                costumes.push(costumeName);
            }
        }
        return costumes;
    }

    getQuestReward(reward) {
        // TODO: Use format method
        switch (reward.type) {
            case 2:
                // item
                //return i18n.__('quest_reward_' + reward.type + '_formatted', { item: reward.info.item_id, amount: reward.info.amount });
                return reward.info.amount + ' ' + this.getItemName(reward.info.item_id);
            case 3:
                // stardust
                //return i18n.__('quest_reward_' + reward.type + '_formatted', reward.info.amount);
                return reward.info.amount + ' ' + i18n.__('quest_reward_' + reward.type);
            case 4:
                // candy
                //const candy = this.getItemName(reward.info.item_id);
                //return candy;
                //return i18n.__('quest_reward_' + reward.type + '_formatted', { item: reward.info.item_id, amount: reward.info.amount });
                return reward.info.amount + ' ' + this.getItemName(reward.info.item_id);
            case 7:
                // pokemon name
                return this.getPokemonName(reward.info.pokemon_id);
            case 12:
                // mega candy
                //return this.getPokemonName(reward.info.pokemon_id); //+ amount
                //return i18n.__('quest_reward_' + reward.type + '_formatted', { pokemon: reward.info.pokemon_id, amount: reward.info.amount });
                return reward.info.amount + ' ' + this.getPokemonName(reward.info.pokemon_id) + ' Mega Energy';
        }
        return null;
    }

    /* eslint-enable no-unused-vars */
    async getPokemonIcon(pokemonId, form = 0, evolution = 0, gender = 0, costume = 0, shiny = false) {
        return `${config.urls.images.pokemon}/${await this.resolvePokemonIcon(pokemonId, form, evolution, gender, costume, shiny)}.png`;
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
                            if (lookup.has(result + '.png')) return result;
                        }
                    }
                }
            }
        }
        return '0'; // substitute
    }
}

module.exports = new Localizer();
