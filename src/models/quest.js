'use strict';

const query = require('../services/db.js');

class Quest {
    constructor(guildId, userId, reward, city) {
        this.guildId = guildId;
        this.userId = userId;
        this.reward = reward;
        this.city = city;
    }
    async create() {
        const sql = `
        INSERT INTO quests (guild_id, userId, reward, city)
        VALUES (?, ?, ?, ?)
        `;
        const args = [this.guildId, this.userId, this.reward, this.city];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getAll(guildId, userId) {
        const sql = `
        SELECT guild_id, userId, reward, city
        FROM quests
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Quest(
                    result.guild_id,
                    result.userId,
                    result.reward,
                    result.city
                ));
            });
            return list;
        }
        return null;
    }
    static async getById(id) {
        const sql = `
        SELECT guild_id, userId, reward, city
        FROM quests
        WHERE id = ?
        `;
        const args = [id];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Quest(
                result.guild_id,
                result.userId,
                result.reward,
                result.city
            );
        }
        return null;
    }
    static async getByReward(guildId, userId, reward, city) {
        const sql = `
        SELECT guild_id, userId, reward, city
        FROM quests
        WHERE guild_id = ? AND userId = ? AND reward = ? AND city = ?
        LIMIT 1
        `;
        const args = [guildId, userId, reward, city];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            return new Quest(
                result.guild_id,
                result.userId,
                result.reward,
                result.city
            );
        }
        return null;
    }
    static async delete(guildId, userId, reward, city) {
        const sql = `
        DELETE FROM quests
        WHERE guild_id = ? AND userId = ? AND reward = ? AND city = ?
        `;
        const args = [guildId, userId, reward, city];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async deleteById(id) {
        const sql = `
        DELETE FROM quests
        WHERE id = ?
        `;
        const args = [id];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM quests
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const result = await query(sql, args);
        return result.affectedRows > 0;
    }
    async save(newReward, newCity) {
        const sql = `
        UPDATE quests
        SET reward = ? AND city = ?
        WHERE guild_id = ? AND userId = ? AND reward = ? AND city = ?
        `;
        const args = [
            newReward,
            newCity,
            this.guildId,
            this.userId,
            this.reward,
            this.city
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Quest;