'use strict';

const query = require('../services/db.js');

class Gym {
    constructor(subscriptionId, guildId, userId, name) {
        this.subscriptionId = subscriptionId;
        this.guildId = guildId;
        this.userId = userId;
        this.name = name;
    }
    async create() {
        const sql = `
        INSERT INTO gyms (subscriptionId, guild_id, userId, name)
        VALUES (?, ?, ?, ?)
        `;
        const args = [
            this.subscriptionId,
            this.guildId, this.userId,
            this.name
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getAll(guildId, userId) {
        const sql = `
        SELECT subscription_id, guild_id, user_id, name
        FROM gyms
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Gym(
                    result.subscription_id,
                    result.guild_id,
                    result.user_id,
                    result.name
                ));
            });
            return list;
        }
        return null;
    }
    static async getByName(guildId, userId, name) {
        const sql = `
        SELECT subscription_id, guild_id, user_id, name
        FROM gyms
        WHERE guild_id = ? AND user_id = ? AND name = ?
        `;
        const args = [guildId, userId, name];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Gym(
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.name
            );
        }
        return null;
    }
    static async getById(id) {
        const sql = `
        SELECT subscription_id, guild_id, user_id, name
        FROM gyms
        WHERE id = ?
        `;
        const args = [id];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Gym(
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.name
            );
        }
        return null;
    }
    static async delete(guildId, userId, name) {
        const sql = `
        DELETE FROM gyms
        WHERE guild_id = ? AND user_id = ? AND name = ?
        `;
        const args = [guildId, userId, name];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async deleteById(id) {
        const sql = `
        DELETE FROM gyms
        WHERE id = ?
        `;
        const args = [id];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM gyms
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const result = await query(sql, args);
        return result.affectedRows > 0;
    }
    static async save(id, guildId, userId, name) {
        const sql = `
        UPDATE gyms
        SET name = ?
        WHERE guild_id = ? AND user_id = ? AND id = ?
        `;
        const args = [
            name,
            guildId,
            userId,
            id
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Gym;