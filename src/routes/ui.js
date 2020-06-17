'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config.json');
const defaultData = require('../data/default.js');
const subscriptions = require('../data/subscriptions.js');
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

router.get('/subscriptions', async (req, res) => {
    const data = defaultData;
    const stats = await subscriptions.getUserSubscriptionStats(data.guild_id, data.user_id);
    data.pokemon_count = stats.pokemon || 0;
    data.raids_count = stats.raids || 0;
    data.quests_count = stats.quests || 0;
    data.invasions_count = stats.invasions || 0;
    res.render('subscriptions', data);
});

router.get('/pokemon', (req, res) => {
    const data = defaultData;
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
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