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

const getPokemonIcon = (pokemonId, formId) => {
    const padId = (pokemonId + '').padStart(3, '0');
    const form = formId > 0 ? formId : '00';
    return util.format(config.urls.images.pokemon, padId, form);
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
    var newArray = array.concat();
    for (let i = 0; i < newArray.length; i++) {
        for (let j = i + 1; j < newArray.length; j++) {
            if (newArray[i] === newArray[j]) {
                newArray.splice(j--, 1);
            }
        }
    }
    return newArray;
};

module.exports = {
    generateString,
    hasGuild,
    hasRole,
    inArray,
    toHHMMSS,
    formatDate,
    getPokemonIcon,
    arraysEqual,
    arrayUnique,
};