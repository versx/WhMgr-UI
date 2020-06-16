'use strict';

const express = require('express');
const router = express.Router();

const subscriptions = require('../data/subscriptions.js');

router.post('/server/:guild_id/user/:user_id', async (req, res) => {
    const { guild_id, user_id } = req.params;
    const type = req.query.type;

    switch (type) {
        case 'subscriptions':
            res.json({ data: { subscriptions: [] } });
            break;
        case 'pokemon':
            const pokemon = await subscriptions.getPokemonSubscriptions(guild_id, user_id);
            res.json({ data: { pokemon: pokemon } });
            break;
        case 'raids':
            const raids = await subscriptions.getRaidSubscriptions(guild_id, user_id);
            res.json({ data: { raids: raids } });
            break;
        case 'quests':
            const quests = await subscriptions.getQuestSubscriptions(guild_id, user_id);
            res.json({ data: { quests: quests } });
            break;
        case 'invasions':
            const invasions = await subscriptions.getInvasionSubscriptions(guild_id, user_id);
            res.json({ data: { invasions: invasions } });
            break;
    }
});

module.exports = router;