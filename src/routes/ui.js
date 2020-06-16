'use strict';

const express = require('express');
const router = express.Router();
//const i18n = require('i18n');

const config = require('../config.json');
const defaultData = require('../data/default.js');
const GeofenceService = require('../services/geofence.js');
const pokedex = require('../../static/data/pokedex.json');

const svc = new GeofenceService.GeofenceService();


router.get(['/', '/index'], async (req, res) => {
    // TODO: List servers or put dropdown for server selection
    res.render('index', defaultData);
});

if (config.discord.enabled) {
    router.get('/login', (req, res) => {
        res.redirect('/api/discord/login');
    });

    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) throw err;
            res.redirect('/login');
        });
    });
}

router.get('/subscriptions', (req, res) => {
    const data = defaultData;
    res.render('subscriptions', data);
});

router.get('/pokemon', (req, res) => {
    const data = defaultData;
    res.render('pokemon', data);
});

router.get('/raids', (req, res) => {
    const data = defaultData;
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('raids', data);
});

router.get('/quests', async (req, res) => {
    const data = defaultData;
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('quests', data);
});

router.get('/invasions', async (req, res) => {
    const data = defaultData;
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('invasions', data);
});

module.exports = router;