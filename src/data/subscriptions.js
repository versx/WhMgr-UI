'use strict';

const query = require('../services/db.js');
const locale = require('../services/locale.js');

// TODO: Move to model classes

async function getUserSubscriptionId(guildId, userId) {
    const sql = `
    SELECT id
    FROM subscriptions
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results && results.length > 0) {
        return results[0].id;
    }
    return results;
}

async function createUserSubscription(guildId, userId) {
    const sql = `
    INSERT IGNORE INTO subscriptions (guild_id, userId, enabled, distance, latitude, longitude, icon_style)
    VALUES (?, ?, 1, 0, 0, 0, 'Default')
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results && results.length > 0) {
        console.log('Inserted', results.lastInsertId, 'into subscriptions table');
        return results.lastInsertId;
    }
    return -1;
}

async function getUserSubscriptionStats(guildId, userId) {
    const sql = `
    SELECT
        (
            SELECT COUNT(id)
            FROM   pokemon
            WHERE guild_id = ? AND user_id = ?
        ) AS pokemon,
        (
            SELECT COUNT(id)
            FROM   pvp
            WHERE guild_id = ? AND user_id = ?
        ) AS pvp,
        (
            SELECT COUNT(id)
            FROM   raids
            WHERE guild_id = ? AND user_id = ?
        ) AS raids,
        (
            SELECT COUNT(id)
            FROM   gyms
            WHERE guild_id = ? AND user_id = ?
        ) AS gyms,
        (
            SELECT COUNT(id)
            FROM   quests
            WHERE guild_id = ? AND user_id = ?
        ) AS quests,
        (
            SELECT COUNT(id)
            FROM   invasions
            WHERE guild_id = ? AND user_id = ?
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
    SELECT id, guild_id, user_id, pokemon_id, form, min_cp, min_iv, iv_list, min_lvl, max_lvl, gender, city
    FROM pokemon
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results) {
        results.forEach(result => {
            result.name = locale.getPokemonName(result.pokemon_id);
            result.cp = `${result.min_cp}-4096`;
            result.iv = result.min_iv;
            result.iv_list = JSON.parse(result.iv_list || '[]');
            result.lvl = `${result.min_lvl}-${result.max_lvl}`;
            result.city = result.city;
        });
    }
    return results;
}

async function getPvpSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, user_id, pokemon_id, form, league, min_rank, min_percent, city
    FROM pvp
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results) {
        results.forEach(result => {
            result.name = locale.getPokemonName(result.pokemon_id);
            result.min_rank = result.min_rank;
            result.city = result.city;
        });
    }
    return results;
}

async function getRaidSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, user_id, pokemon_id, form, city
    FROM raids
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results) {
        results.forEach(result => {
            result.name = locale.getPokemonName(result.pokemon_id);
        });
    }
    return results;
}

async function getGymSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, user_id, name
    FROM gyms
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    return results;
}

async function getQuestSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, user_id, reward, city
    FROM quests
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    return results;
}

async function getInvasionSubscriptions(guildId, userId) {
    const sql = `
    SELECT id, guild_id, user_id, reward_pokemon_id, city
    FROM invasions
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results) {
        results.forEach(result => {
            result.reward = locale.getPokemonName(result.reward_pokemon_id);
        });
    }
    return results;
}

async function getSubscriptionSettings(guildId, userId) {
    const sql = `
    SELECT enabled, distance, latitude, longitude, icon_style
    FROM subscriptions
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [guildId, userId];
    const results = await query(sql, args);
    if (results && results.length > 0) {
        return results[0];
    }
    return results;
}

async function setSubscriptionSettings(guildId, userId, enabled, distance, latitude, longitude, icon_style) {
    const sql = `
    UPDATE subscriptions
    SET enabled = ?, distance = ?, latitude = ?, longitude = ?, icon_style = ?
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [
        enabled,
        distance,
        latitude,
        longitude,
        icon_style,
        guildId,
        userId
    ];
    const results = await query(sql, args);
    return results.affectedRows > 0;;
}

module.exports = {
    getUserSubscriptionId,
    createUserSubscription,
    getUserSubscriptionStats,
    getPokemonSubscriptions,
    getPvpSubscriptions,
    getRaidSubscriptions,
    getGymSubscriptions,
    getQuestSubscriptions,
    getInvasionSubscriptions,
    getSubscriptionSettings,
    setSubscriptionSettings
};