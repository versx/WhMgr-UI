'use strict';

const config = require('../config.json');
const data = require('../../static/locales/' + config.locale + '.json');
data.title = config.title;
data.locale = config.locale;
data.body_class = config.style === 'dark' ? 'theme-dark' : '';
data.table_class = config.style === 'dark' ? 'table-dark' : '';
data.favicon = config.favicon;
data.copyright_footer = config.showFooter;
data.servers = config.discord.guilds;
data.genders = [
    { 'id': '*', 'name': 'All' },
    { 'id': 'm', 'name': 'Male' },
    { 'id': 'f', 'name': 'Female', }
];
data.leagues = config.pvp.leagues.map(league => {
    return { 'name': league };
});
data.icon_styles = config.iconStyles;
data.enable_geofence_roles = config.enableGeofenceRoles;
data.hide_phone_number = config.hidePhoneNumber;
data.sizes = [
    { name: 'All', value: 0, },
    { name: 'Tiny', value: 1, },
    { name: 'Small', value: 2, },
    { name: 'Normal', value: 3, },
    { name: 'Large', value: 4, },
    { name: 'Big', value: 5, },
];
// Leaflet map properties
data.min_zoom = config.map.minZoom;
data.max_zoom = config.map.maxZoom;
data.tileserver = config.map.tileserver;

module.exports = data;