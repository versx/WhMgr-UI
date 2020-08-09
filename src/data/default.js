'use strict';

const config = require('../config.json');
const data = require('../../static/locales/' + config.locale + '.json');
data.title = config.title;
data.locale = config.locale;
data.style = config.style == 'dark' ? 'dark' : '';
data.copyright_footer = config.showFooter;
data.servers = config.discord.guilds;
data.genders = [
    { 'id': '*', 'name': 'All' },
    { 'id': 'm', 'name': 'Male' },
    { 'id': 'f', 'name': 'Female', }
];
data.leagues = [
    { 'id': 'great', 'name': 'Great' },
    { 'id': 'ultra', 'name': 'Ultra' },
    //{ 'id': 'master', 'name': 'Master' },
];
data.icon_styles = config.iconStyles;

module.exports = data;