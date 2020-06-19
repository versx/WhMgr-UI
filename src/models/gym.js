'use strict';

const query = require('../services/db.js');

class Gym {
    constructor(guildId, userId, name) {
        this.guildId = guildId;
        this.userId = userId;
        this.name = name;
    }
    async create() {
        const sql = `
        INSERT INTO gyms (guild_id, userId, name)
        VALUES (?, ?, ?)
        `;
        const args = [this.guildId, this.userId, this.name];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getAll(guildId, userId) {
        const sql = `
        SELECT guild_id, userId, name
        FROM gyms
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Gym(
                    result.guild_id,
                    result.userId,
                    result.name
                ));
            });
            return list;
        }
        return null;
    }
    static async getByName(guildId, userId, name) {
        const sql = `
        SELECT guild_id, userId, name
        FROM gyms
        WHERE guild_id = ? AND userId = ? AND name = ?
        `;
        const args = [guildId, userId, name];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Gym(
                result.guild_id,
                result.userId,
                result.name
            );
        }
        return null;
    }
    static async getById(id) {
        const sql = `
        SELECT guild_id, userId, name
        FROM gyms
        WHERE id = ?
        `;
        const args = [id];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Gym(
                result.guild_id,
                result.userId,
                result.name
            );
        }
        return null;
    }
    static async delete(guildId, userId, name) {
        const sql = `
        DELETE FROM gyms
        WHERE guild_id = ? AND userId = ? AND name = ?
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
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const result = await query(sql, args);
        return result.affectedRows > 0;
    }
    static async save(id, guildId, userId, name) {
        const sql = `
        UPDATE gyms
        SET name = ?
        WHERE guild_id = ? AND userId = ? AND id = ?
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