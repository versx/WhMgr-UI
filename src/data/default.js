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
data.servers = [
    { name: 'versx' },
    { name: 'SGV Scans' },
    { name: 'Riviera Village Feeds' },
    { name: 'OC Scans' }
];

module.exports = data;