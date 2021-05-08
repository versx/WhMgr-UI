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
data.leagues = [
    { 'id': 'great', 'name': 'Great' },
    { 'id': 'ultra', 'name': 'Ultra' },
    //{ 'id': 'master', 'name': 'Master' },
];
data.icon_styles = config.iconStyles;
data.enable_geofence_roles = config.enableGeofenceRoles;
data.hide_phone_number = config.hidePhoneNumber;
// Leaflet map properties
data.start_lat = config.map.startLat;
data.start_lon = config.map.startLon;
data.start_zoom = config.map.startZoom;
data.min_zoom = config.map.minZoom;
data.max_zoom = config.map.maxZoom;
data.tileserver = config.map.tileserver;

module.exports = data;