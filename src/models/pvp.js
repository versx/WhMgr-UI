'use strict';

const query = require('../services/db.js');

class PVP {
    constructor(guildId, userId, pokemonId, form, league, minRank, minPercent) {
        this.guildId = guildId;
        this.userId = userId;
        this.pokemonId = pokemonId;
        this.form = form;
        this.league = league;
        this.minRank = minRank;
        this.minPercent = minPercent;
    }
    async create() {
        const sql = `
        INSERT INTO pvp (guild_id, userId, pokemon_id, form, league, miv_rank, min_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const args = [
            this.guildId, this.userId, this.pokemonId,
            this.form, this.league, this.minRank,
            this.minPercent
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getAll(guildId, userId) {
        const sql = `
        SELECT guild_id, userId, pokemon_id, form, league, miv_rank, min_percent
        FROM pvp
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new PVP(
                    result.guild_id,
                    result.userId,
                    result.pokemon_id,
                    result.form,
                    result.league,
                    result.miv_rank,
                    result.min_percent
                ));
            });
            return list;
        }
        return null;
    }
    static async getPokemonByLeague(guildId, userId, pokemonId, form, league) { // TODO: City
        const sql = `
        SELECT guild_id, userId, pokemon_id, form, league, miv_rank, min_percent
        FROM pvp
        WHERE guild_id = ? AND userId = ? AND pokemon_id = ? AND form = ? AND league = ?
        `;
        const args = [guildId, userId, pokemonId, form, league];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new PVP(
                result.guild_id,
                result.userId,
                result.pokemon_id,
                result.form,
                result.league,
                result.miv_rank,
                result.min_percent
            );
        }
        return null;
    }
    static async getById(id) {
        const sql = `
        SELECT guild_id, userId, pokemon_id, form, league, miv_rank, min_percent
        FROM pvp
        WHERE id = ?
        `;
        const args = [id];
        const results = await query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new PVP(
                result.guild_id,
                result.userId,
                result.pokemon_id,
                result.form,
                result.league,
                result.miv_rank,
                result.min_percent
            );
        }
        return null;
    }
    static async deleteById(id) {
        const sql = `
        DELETE FROM pvp
        WHERE id = ?
        `;
        const args = [id];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM pvp
        WHERE guild_id = ? AND userId = ?
        `;
        const args = [guildId, userId];
        const result = await query(sql, args);
        return result.affectedRows > 0;
    }
    static async save(id, guildId, userId, pokemonId, form, league, minRank, minPercent) {
        const sql = `
        UPDATE pvp
        SET pokemon_id = ?, form = ?, league = ?, miv_rank = ?, min_percent = ?
        WHERE guild_id = ? AND userId = ? AND id = ?
        `;
        const args = [
            pokemonId,
            form,
            league,
            minRank,
            minPercent,
            guildId,
            userId,
            id
        ];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = PVP;