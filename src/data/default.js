'use strict';

const config = require('../config.json');
const data = require('../../static/locales/' + config.locale + '.json');
data.title = config.title;
data.locale = config.locale;
data.style = config.style == 'dark' ? 'dark' : '';
data.home_page = true;
data.pokemon_page = true;
data.raids_page = true;
data.copyright_footer = config.showFooter;
data.servers = config.discord.guilds;
data.genders = [
    { 'id': '*', 'name': 'All' },
    { 'id': 'm', 'name': 'Male' },
    { 'id': 'f', 'name': 'Female', }
]

module.exports = data;