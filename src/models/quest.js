'use strict';

const config = require('../config.json');
const MySQLConnector = require('../services/mysql.js');
const db = new MySQLConnector(config.db.brock);

class Quest {
    constructor(subscriptionId, guildId, userId, reward, city) {
        this.subscriptionId = subscriptionId;
        this.guildId = guildId;
        this.userId = userId;
        this.reward = reward;
        this.city = city;
    }
    async create() {
        const sql = `
        INSERT INTO quests (subscription_id, guild_id, user_id, reward, city)
        VALUES (?, ?, ?, ?, ?)
        `;
        const args = [
            this.subscriptionId,
            this.guildId, this.userId,
            this.reward,
            JSON.stringify(this.city || []),
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async getAll(guildId, userId) {
        const sql = `
        SELECT subscription_id, guild_id, user_id, reward, city
        FROM quests
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Quest(
                    result.subscription_id,
                    result.guild_id,
                    result.user_id,
                    result.reward,
                    JSON.parse(result.city || '[]'),
                ));
            });
            return list;
        }
        return null;
    }

    static async getById(id) {
        const sql = `
        SELECT subscription_id, guild_id, user_id, reward, city
        FROM quests
        WHERE id = ?
        `;
        const args = [id];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Quest(
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.reward,
                JSON.parse(result.city || '[]'),
            );
        }
        return null;
    }
    
    static async getByReward(guildId, userId, reward) {
        const sql = `
        SELECT subscription_id, guild_id, user_id, reward, city
        FROM quests
        WHERE guild_id = ? AND user_id = ? AND reward = ?
        LIMIT 1
        `;
        const args = [guildId, userId, reward];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            let result = results[0];
            return new Quest(
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.reward,
                JSON.parse(result.city || '[]'),
            );
        }
        return null;
    }

    static async delete(guildId, userId, reward) {
        const sql = `
        DELETE FROM quests
        WHERE guild_id = ? AND user_id = ? AND reward = ?
        `;
        const args = [guildId, userId, reward];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async deleteById(id) {
        const sql = `
        DELETE FROM quests
        WHERE id = ?
        `;
        const args = [id];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM quests
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const result = await db.query(sql, args);
        return result.affectedRows > 0;
    }

    static async save(id, guildId, userId, reward, city) {
        const sql = `
        UPDATE quests
        SET reward = ?, city = ?
        WHERE guild_id = ? AND user_id = ? AND id = ?
        `;
        const args = [
            reward,
            JSON.stringify(city),
            guildId,
            userId,
            id
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Quest;