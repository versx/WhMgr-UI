'use strict';

const query = require('../services/db.js');

class Raid {
    constructor(guildId, userId, pokemonId, form, city) {
        this.guildId = guildId;
        this.userId = userId;
        this.pokemonId = pokemonId;
        this.form = form;
        this.city = city;
    }
    async create() {
        const sql = `
        INSERT INTO raids (guild_id, userId, pokemon_id, form, city)
        VALUES (?, ?, ?, ?, ?)
        `;
        const args = [this.guildId, this.userId, this.pokemonId, this.form, this.city];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getAll(guildId, userId) {
        const sql = `
        SELECT guild_id, userId, pokemonId, form, city
        FROM raids
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Raid(
                    result.guild_id,
                    result.userId,
                    result.pokemonId,
                    result.form,
                    result.city
                ));
            });
            return list;
        }
        return null;
    }
    static async getByPokemon(guildId, userId, pokemonId, form, city) {
        const sql = `
        SELECT guild_id, userId, pokemon_id, form, city
        FROM raids
        WHERE guild_id = ? AND userId = ? AND pokemon_id = ? AND form = ? AND city = ?
        LIMIT 1
        `;
        const args = [guildId, userId, pokemonId, form, city];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            return new Raid(
                result.guild_id,
                result.userId,
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
        WHERE guild_id = ? AND userId = ? AND pokemon_id = ? AND form = ? AND city = ?
        `;
        const args = [guildId, userId, pokemonId, form, city];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM raids
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const result = await query(sql, args);
        return result.affectedRows > 0;
    }
    async save(newPokemonId, newForm, newCity) {
        const sql = `
        UPDATE raids
        SET pokemon_id = ? AND form = ? AND city = ?
        WHERE guild_id = ? AND userId = ? AND pokemon_id = ? AND form = ? AND city = ?
        `;
        const args = [
            newPokemonId,
            newForm,
            newCity,
            this.guildId,
            this.userId,
            this.pokemonId,
            this.form,
            this.city
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Raid;