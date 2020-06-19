'use strict';

const query = require('../services/db.js');

const pokedex = require('../../static/data/pokedex.json');

// TODO: Move to model classes

async function getUserSubscriptionStats(guildId, userId) {
    const sql = `
    SELECT
        (
            SELECT COUNT(id)
            FROM   pokemon
            WHERE guild_id = ? AND userId = ?
        ) AS pokemon,
        (
            SELECT COUNT(id)
            FROM   pvp
            WHERE guild_id = ? AND userId = ?
        ) AS pvp,
        (
            SELECT COUNT(id)
            FROM   raids
            WHERE guild_id = ? AND userId = ?
        ) AS raids,
        (
            SELECT COUNT(id)
            FROM   gyms
            WHERE guild_id = ? AND userId = ?
        ) AS gyms,
        (
            SELECT COUNT(id)
            FROM   quests
            WHERE guild_id = ? AND userId = ?
        ) AS quests,
        (
            SELECT COUNT(id)
            FROM   invasions
            WHERE guild_id = ? AND userId = ?
        ) AS invasions
    FROM subscriptions
    LIMIT 1;
    `;
    const args = [
        guildId, userId,
        guildId, userId,
        guildId, userId,
        guildId, userId,
        guildId, userId,
        guildId, userId
    ];
    const results = await query(sql, args);
    if (results && results.length > 0) {
        return results[0];
    }
    return results;
}

async function getPokemonSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, userId, pokemon_id, form, min_cp, miv_iv, min_lvl, max_lvl, gender
    FROM pokemon
    WHERE guild_id = ? AND userId = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results) {
        results.forEach(result => {
            result.name = pokedex[result.pokemon_id];
            result.cp = `${result.min_cp}-4096`;
            result.iv = result.miv_iv;
            result.lvl = `${result.min_lvl}-${result.max_lvl}`;
            result.city = ''; // TODO: City
            //result.guild_id = result.guild_id.toString();
            //result.userId = result.userId.toString();
        });
    }
    return results;
}

async function getPvpSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, userId, pokemon_id, form, league, miv_rank, min_percent
    FROM pvp
    WHERE guild_id = ? AND userId = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results) {
        results.forEach(result => {
            result.name = pokedex[result.pokemon_id];
            result.min_rank = result.miv_rank;
            result.city = ''; // TODO: City
        });
    }
    return results;
}

async function getRaidSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, userId, pokemon_id, form, city
    FROM raids
    WHERE guild_id = ? AND userId = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results) {
        results.forEach(result => {
            result.name = pokedex[result.pokemon_id];
        });
    }
    return results;
}

async function getGymSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, userId, name
    FROM gyms
    WHERE guild_id = ? AND userId = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    return results;
}

async function getQuestSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, userId, reward, city
    FROM quests
    WHERE guild_id = ? AND userId = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    return results;
}

async function getInvasionSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, userId, reward_pokemon_id, city
    FROM invasions
    WHERE guild_id = ? AND userId = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results) {
        results.forEach(result => {
            result.reward = pokedex[result.reward_pokemon_id];
        });
    }
    return results;
}

module.exports = {
    getUserSubscriptionStats,
    getPokemonSubscriptions,
    getPvpSubscriptions,
    getRaidSubscriptions,
    getGymSubscriptions,
    getQuestSubscriptions,
    getInvasionSubscriptions
};