'use strict';

const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const express = require('express');
const router = express.Router();

const subscriptions = require('../data/subscriptions.js');

router.post('/server/:guild_id/user/:user_id', async (req, res) => {
    const { guild_id, user_id } = req.params;
    const type = req.query.type;
    console.log('Path:', req.path);
    console.log('Query:', req.query);

    if (guild_id === null) {
        console.warn('[WARN] Guild ID is null.');
        return;
    }

    switch (type) {
        case 'subscriptions':
            const subscription = await subscriptions.getUserSubscriptionStats(guild_id, user_id);
            res.json({ data: { subscriptions: subscription } });
            break;
        case 'pokemon':
            const pokemon = await subscriptions.getPokemonSubscriptions(guild_id, user_id);
            if (pokemon) {
                pokemon.forEach(pkmn => {
                    pkmn.buttons = '<button class="btn btn-danger">Delete</button>';
                });
            }
            res.json({ data: { pokemon: pokemon } });
            break;
        case 'raids':
            const raids = await subscriptions.getRaidSubscriptions(guild_id, user_id);
            if (raids) {
                raids.forEach(raid => {
                    raid.buttons = '<button class="btn btn-danger">Delete</button>';
                });
            }
            res.json({ data: { raids: raids } });
            break;
        case 'quests':
            const quests = await subscriptions.getQuestSubscriptions(guild_id, user_id);
            if (quests) {
                quests.forEach(quest => {
                    quest.buttons = '<button class="btn btn-danger">Delete</button>';
                });
            }
            res.json({ data: { quests: quests } });
            break;
        case 'invasions':
            const invasions = await subscriptions.getInvasionSubscriptions(guild_id, user_id);
            if (invasions) {
                invasions.forEach(invasion => {
                    invasion.buttons = '<button class="btn btn-danger">Delete</button>';
                });
            }
            res.json({ data: { invasions: invasions } });
            break;
    }
});

module.exports = router;