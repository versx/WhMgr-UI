'use strict';

const query = require('../services/db.js');

class Pokemon {
    constructor(subscriptionId, guildId, userId, pokemonId, form, minCP, minIV, minLvl, maxLvl, gender, city) {
        this.subscriptionId = subscriptionId;
        this.guildId = guildId;
        this.userId = userId;
        this.pokemonId = pokemonId;
        this.form = form;
        this.minCP = minCP;
        this.minIV = minIV;
        this.minLvl = minLvl;
        this.maxLvl = maxLvl;
        this.gender = gender;
        this.city = city;
    }
    async create() {
        const sql = `
        INSERT INTO pokemon (subscription_id, guild_id, userId, pokemon_id, form, min_cp, miv_iv, min_lvl, max_lvl, gender, city)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const args = [
            this.subscriptionId,
            this.guildId, this.userId,
            this.pokemonId, this.form,
            this.minCP, this.minIV,
            this.minLvl, this.maxLvl,
            this.gender, this.city
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getAll(guildId, userId) {
        const sql = `
        SELECT guild_id, userId, pokemon_id, form, min_cp, miv_iv, min_lvl, max_lvl, gender, city
        FROM pokemon
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Pokemon(
                    result.guild_id,
                    result.userId,
                    result.pokemon_id,
                    result.form,
                    result.min_cp,
                    result.miv_iv,
                    result.min_lvl,
                    result.max_lvl,
                    result.gender,
                    result.city
                ));
            });
            return list;
        }
        return null;
    }
    static async getByPokemon(guildId, userId, pokemonId, form, city) {
        const sql = `
        SELECT guild_id, userId, pokemon_id, form, min_cp, miv_iv, min_lvl, max_lvl, gender, city
        FROM pokemon
        WHERE guild_id = ? AND userId = ? AND pokemon_id = ? AND form = ? AND city = ?
        `;
        const args = [guildId, userId, pokemonId, form, city];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Pokemon(
                result.guild_id,
                result.userId,
                result.pokemon_id,
                result.form,
                result.min_cp,
                result.miv_iv,
                result.min_lvl,
                result.max_lvl,
                result.gender,
                result.city
            );
        }
        return null;
    }
    static async getById(id) {
        const sql = `
        SELECT guild_id, userId, pokemon_id, form, min_cp, miv_iv, min_lvl, max_lvl, gender, city
        FROM pokemon
        WHERE id = ?
        `;
        const args = [id];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Pokemon(
                result.guild_id,
                result.userId,
                result.pokemon_id,
                result.form,
                result.min_cp,
                result.miv_iv,
                result.min_lvl,
                result.max_lvl,
                result.gender,
                result.city
            );
        }
        return null;
    }
    static async deleteById(id) {
        const sql = `
        DELETE FROM pokemon
        WHERE id = ?
        `;
        const args = [id];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM pokemon
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const result = await query(sql, args);
        return result.affectedRows > 0;
    }
    static async save(id, guildId, userId, pokemonId, form, minCP, minIV, minLvl, maxLvl, gender, city) {
        const sql = `
        UPDATE pokemon
        SET pokemon_id = ?, form = ?, min_cp = ?, miv_iv = ?, min_lvl = ?, max_lvl = ?, gender = ?, city = ?
        WHERE guild_id = ? AND userId = ? AND id = ?
        `;
        const args = [
            pokemonId,
            form,
            minCP,
            minIV,
            minLvl,
            maxLvl,
            gender,
            city,
            guildId,
            userId,
            id
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Pokemon;