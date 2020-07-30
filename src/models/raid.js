'use strict';

const query = require('../services/db.js');

class Raid {
    constructor(subscriptionId, guildId, userId, pokemonId, form, city) {
        this.subscriptionId = subscriptionId;
        this.guildId = guildId;
        this.userId = userId;
        this.pokemonId = pokemonId;
        this.form = form;
        this.city = city;
    }
    async create() {
        const sql = `
        INSERT INTO raids (subscription_id, guild_id, user_id, pokemon_id, form, city)
        VALUES (?, ?, ?, ?, ?, ?)
        `;
        const args = [
            this.subscriptionId,
            this.guildId, this.userId,
            this.pokemonId, this.form,
            this.city
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getAll(guildId, userId) {
        const sql = `
        SELECT subscription_id, guild_id, user_id, pokemon_id, form, city
        FROM raids
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Raid(
                    result.subscription_id,
                    result.guild_id,
                    result.user_id,
                    result.pokemonId,
                    result.form,
                    result.city
                ));
            });
            return list;
        }
        return null;
    }
    static async getById(id) {
        const sql = `
        SELECT subscription_id, guild_id, user_id, pokemon_id, form, city
        FROM raids
        WHERE id = ?
        `;
        const args = [id];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Raid(
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.pokemon_id,
                result.form,
                result.city
            );
        }
        return null;
    }
    static async getByPokemon(guildId, userId, pokemonId, form, city) {
        const sql = `
        SELECT subscription_id, guild_id, user_id, pokemon_id, form, city
        FROM raids
        WHERE guild_id = ? AND user_id = ? AND pokemon_id = ? AND form = ? AND city = ?
        LIMIT 1
        `;
        const args = [guildId, userId, pokemonId, form, city];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            let result = results[0];
            return new Raid(
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.pokemonId,
                result.form,
                result.city
            );
        }
        return null;
    }
    static async delete(guildId, userId, pokemonId, form, city) {
        const sql = `
        DELETE FROM raids
        WHERE guild_id = ? AND user_id = ? AND pokemon_id = ? AND form = ? AND city = ?
        `;
        const args = [guildId, userId, pokemonId, form, city];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async deleteById(id) {
        const sql = `
        DELETE FROM raids
        WHERE id = ?
        `;
        const args = [id];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM raids
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const result = await query(sql, args);
        return result.affectedRows > 0;
    }
    static async save(id, guildId, userId, pokemonId, form, city) {
        const sql = `
        UPDATE raids
        SET pokemon_id = ?, form = ?, city = ?
        WHERE guild_id = ? AND user_id = ? AND id = ?
        `;
        const args = [
            pokemonId,
            form,
            city,
            guildId,
            userId,
            id
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Raid;