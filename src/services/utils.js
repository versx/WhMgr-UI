'use strict';

const util = require('util');
const config = require('../config.json');

const generateString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const hasGuild = (guilds) => {
    if (config.discord.guilds.length === 0) {
        return true;
    }
    for (let i = 0; i < guilds.length; i++) {
        const guild = guilds[i];
        if (config.discord.guilds.find(x => x.id === guild)) {
            return true;
        }
    }
    return false;
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

const getPokemonIcon = (pokemonId, formId) => {
    const padId = (pokemonId + '').padStart(3, '0');
    const form = formId > 0 ? formId : '00';
    return util.format(config.urls.images.pokemon, padId, form);
};

module.exports = {
    generateString,
    hasGuild,
    hasRole,
    inArray,
    toHHMMSS,
    formatDate,
    getPokemonIcon
};