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
// TODO: Only show guilds user is apart of
data.servers = config.discord.guilds;

module.exports = data;