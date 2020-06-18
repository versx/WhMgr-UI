'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config.json');
const defaultData = require('../data/default.js');
const map = require('../data/map.js');
const subscriptions = require('../data/subscriptions.js');
const GeofenceService = require('../services/geofence.js');

const svc = new GeofenceService.GeofenceService();


router.get(['/', '/index'], async (req, res) => {
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
    // TODO: Remove below
    const stats = await subscriptions.getUserSubscriptionStats(data.guild_id, data.user_id);
    data.pokemon_count = stats.pokemon || 0;
    data.raids_count = stats.raids || 0;
    data.quests_count = stats.quests || 0;
    data.invasions_count = stats.invasions || 0;
    res.render('subscriptions', data);
});


// Pokemon Routes
router.get('/pokemon', (req, res) => {
    const data = defaultData;
    data.pokemon = map.getPokemonNameIdsList();
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('pokemon', data);
});

router.get('/pokemon/new', (req, res) => {
    const data = defaultData;
    data.pokemon = map.getPokemonNameIdsList();
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('pokemon-new', data);
});

router.get('/pokemon/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('pokemon-delete', data);
});


// Raid routes
router.get('/raids', (req, res) => {
    const data = defaultData;
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('raids', data);
});

router.get('/raid/new', (req, res) => {
    const data = defaultData;
    data.pokemon = map.getPokemonNameIdsList();
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('raid-new', data);
});

router.get('/raid/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('raid-delete', data);
});


// Quest routes
router.get('/quests', (req, res) => {
    const data = defaultData;
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('quests', data);
});

router.get('/quest/new', (req, res) => {
    const data = defaultData;
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('quest-new', data);
});

router.get('/quest/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('quest-delete', data);
});


// Invasion routes
router.get('/invasions', (req, res) => {
    const data = defaultData;
    res.render('invasions', data);
});

router.get('/invasion/new', (req, res) => {
    const data = defaultData;
    data.rewards = map.getGruntRewardIdsList();
    data.cities = svc.geofences.map(x => { return { 'name': x.name }; });
    res.render('invasion-new', data);
});

router.get('/invasion/delete/:id', (req, res) => {
    const data = defaultData;
    data.id = req.params.id;
    res.render('invasion-delete', data);
});

module.exports = router;