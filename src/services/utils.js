'use strict';

const config = require('../config.json');
const defaultData = require('../data/default.js');

const generateString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const hasGuild = (guilds) => {
    if (config.discord.guilds.length === 0) {
        return true;
    }
    let result = false;
    for (let i = 0; i < guilds.length; i++) {
        const guild = guilds[i];
        if (config.discord.guilds.find(x => x.id === guild)) {
            result = true;
            break;
        }
    }
    return result;
};

const hasRole = (userRoles, requiredRoles) => {
    if (requiredRoles.length === 0) {
        return true;
    }
    for (let i = 0; i < userRoles.length; i++) {
        const role = userRoles[i];
        if (requiredRoles.includes(role)) {
            return true;
        }
    }
    return false;
};

const inArray = (haystack, needle) => {
    const array = haystack.split(',');
    if (Array.isArray(array)) {
        for (let i = 0; i < array.length; i++) {
            const item = array[i].trim().toLowerCase();
            if (needle.trim().toLowerCase().indexOf(item) > -1) {
                return true;
            }
        }
        return false;
    }
    return needle.trim().indexOf(haystack.trim()) > -1;
};

const toHHMMSS = (secs) => {
    const sec_num = parseInt(secs / 1000, 10);
    const minutes = Math.floor(sec_num / 60) % 60;
    //var seconds = sec_num % 60;
    //return `${minutes}m ${seconds}s`;
    return `${minutes}m`;
};

const formatDate = (date) => {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
};

const arraysEqual = (array1, array2) => {
    if (array1 === array2) return true;
    if (array1 == null || array2 == null) return false;
    if (array1.length !== array2.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
    array1.sort();
    array2.sort();
  
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }
    return true;
};

const arrayUnique = (array) => {
    let newArray = array.concat();
    for (let i = 0; i < newArray.length; i++) {
        for (let j = i + 1; j < newArray.length; j++) {
            if (newArray[i] === newArray[j]) {
                newArray.splice(j--, 1);
            }
        }
    }
    return newArray;
};

const parseJsonColumn = (data) => {
    return Array.isArray(data)
        ? data
        : JSON.parse(data || '[]');
};

const getAreas = (guildId, city) => {
    let areas;
    const All = 'All';
    const None = 'None';
    if (city === All || (Array.isArray(city) && city.includes(All))) {
        // If 'All' specified set areas to all guild geofences
        for (const guild of config.discord.guilds) {
            if (guild.id !== guildId) {
                continue;
            }
            areas = guild.geofences;
        }
    } else if (city === None || !city) {
        // No areas specified
        areas = [];
    } else if (!Array.isArray(city)) {
        // Only one area specified, make array
        areas = [city];
    } else {
        // If all and none are both specified, all supersedes none or individual areas
        // or if all is specified and none is not, set all available areas and disregard
        // individual areas that might be included.
        if ((city.includes(All) && city.includes(None)) ||
            (city.includes(All) && !city.includes(None))) {
            return getAreas(guildId, All);
        } else if (city.includes(None) && city.length > 1) {
            // None is specified but other areas are as well,
            // get the index of the None string and remove it
            // from the list.
            areas = city.splice(city.indexOf(None), 1);
        } else {
            // Only individual areas are provided
            areas = city;
        }
    }
    return areas || [];
};

const toNumbers = (array) => {
    const pokemonIds = (array || '')
        .replace(' ,', ',')
        .replace(', ', ',')
        .split(',');
    const ids = (pokemonIds || []).map(Number);
    return ids.join(',');
};

const isUltraRarePokemon = (pokemonId) => {
    const ultraRareList = [
        201, // Unown
        480, // Uxie
        481, // Mesprit
        482, // Azelf
    ];
    return ultraRareList.includes(pokemonId);
};

const formatPokemonSize = (size) => {
    switch (size) {
        case 1: return 'Tiny';
        case 2: return 'Small';
        case 3: return 'Normal';
        case 4: return 'Large';
        case 5: return 'Big';
        default: return 'All';
    }
};

const formatAreas = (guildId, subscriptionAreas) => {
    return arraysEqual(subscriptionAreas, config.discord.guilds.filter(x => x.id === guildId)[0].geofences)
        ? 'All' // TODO: Localize
        : ellipsis(subscriptionAreas.join(','));
};

const ellipsis = (str) => {
    const value = str.substring(0, Math.min(64, str.length));
    return value === str ? value : value + '...';
};

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

const cleanArray = (array) => {
    if (!array) {
        return null;
    }
    const arr = (array || '').split(',');
    const cleanedArr = arr.map(String);
    return cleanedArr.join(',');
};

module.exports = {
    generateString,
    hasGuild,
    hasRole,
    inArray,
    toHHMMSS,
    formatDate,
    arraysEqual,
    arrayUnique,
    parseJsonColumn,
    getAreas,
    ellipsis,
    toNumbers,
    isUltraRarePokemon,
    formatPokemonSize,
    formatAreas,
    showError,
    showErrorJson,
    cleanArray,
};