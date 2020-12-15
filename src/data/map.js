'use strict';

const Localizer = require('../services/locale.js');
const config = require('../config.json');

const getPokemonNameIdsList = async () => {
    let pokemon = [];
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

const getLureTypes = () => {
    return [
        { name: 'Normal' },
        { name: 'Glacial' },
        { name: 'Mossy' },
        { name: 'Magnetic' },
    ];
};

module.exports = {
    getPokemonNameIdsList,
    buildCityList,
    getLureTypes,
};