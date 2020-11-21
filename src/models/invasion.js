'use strict';

const config = require('../config.json');
const MySQLConnector = require('../services/mysql.js');
const db = new MySQLConnector(config.db.brock);

class Invasion {
    constructor(id, subscriptionId, guildId, userId, rewardPokemonId, city) {
        this.id = id;
        this.subscriptionId = subscriptionId;
        this.guildId = guildId;
        this.userId = userId;
        this.rewardPokemonId = rewardPokemonId;
        this.city = city;
    }

    async create() {
        const sql = `
        INSERT INTO invasions (subscription_id, guild_id, user_id, reward_pokemon_id, city)
        VALUES (?, ?, ?, ?, ?)
        `;
        const args = [
            this.subscriptionId,
            this.guildId,
            this.userId,
            this.rewardPokemonId,
            JSON.stringify(this.city || []),
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async getAll(guildId, userId) {
        const sql = `
        SELECT id, subscription_id, guild_id, user_id, reward_pokemon_id, city
        FROM invasions
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Invasion(
                    result.id,
                    result.subscription_id,
                    result.guild_id,
                    result.user_id,
                    result.reward_pokemon_id,
                    JSON.parse(result.city || '[]'),
                ));
            });
            return list;
        }
        return null;
    }

    static async getById(id) {
        const sql = `
        SELECT id, subscription_id, guild_id, user_id, reward_pokemon_id, city
        FROM invasions
        WHERE id = ?
        `;
        const args = [id];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Invasion(
                result.id,
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.reward_pokemon_id,
                JSON.parse(result.city || '[]'),
            );
        }
        return null;
    }

    static async getByReward(guildId, userId, reward) {
        const sql = `
        SELECT id, subscription_id, guild_id, user_id, reward_pokemon_id, city
        FROM invasions
        WHERE guild_id = ? AND user_id = ? AND reward_pokemon_id = ?
        LIMIT 1
        `;
        const args = [guildId, userId, reward];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Invasion(
                result.id,
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.reward_pokemon_id,
                JSON.parse(result.city || '[]'),
            );
        }
        return null;
    }
    
    static async delete(guildId, userId, rewardPokemonId) {
        const sql = `
        DELETE FROM invasions
        WHERE guild_id = ? AND user_id = ? AND reward_pokemon_id = ?
        `;
        const args = [guildId, userId, rewardPokemonId];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async deleteById(id) {
        const sql = `
        DELETE FROM invasions
        WHERE id = ?
        `;
        const args = [id];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM invasions
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const result = await db.query(sql, args);
        return result.affectedRows > 0;
    }

    async save() {
        const sql = `
        UPDATE invasions
        SET reward_pokemon_id = ?, city = ?
        WHERE guild_id = ? AND user_id = ? AND id = ?
        `;
        const args = [
            this.rewardPokemonId,
            JSON.stringify(this.city),
            this.guildId,
            this.userId,
            this.id
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Invasion;