'use strict';

const config = require('../config.json');
const MySQLConnector = require('../services/mysql.js');
const db = new MySQLConnector(config.db.brock);

class Pokemon {

    constructor(id, subscriptionId, guildId, userId, pokemonId, form, minCP, minIV, ivList, minLvl, maxLvl, gender, city) {
        this.id = id;
        this.subscriptionId = subscriptionId;
        this.guildId = guildId;
        this.userId = userId;
        this.pokemonId = pokemonId;
        this.form = form;
        this.minCP = minCP;
        this.minIV = minIV;
        this.ivList = ivList;
        this.minLvl = minLvl;
        this.maxLvl = maxLvl;
        this.gender = gender;
        this.city = city;
    }

    static async create(pokemonSQL) {
        if (pokemonSQL.length === 0) {
            return;
        }
        let sql = `
        INSERT INTO pokemon (id, subscription_id, guild_id, user_id, pokemon_id, form, min_cp, min_iv, iv_list, min_lvl, max_lvl, gender, city) VALUES
        `;
        sql += pokemonSQL.join(',');
        sql += `
        ON DUPLICATE KEY UPDATE
            subscription_id=VALUES(subscription_id),
            guild_id=VALUES(guild_id),
            user_id=VALUES(user_id),
            pokemon_id=VALUES(pokemon_id),
            form=VALUES(form),
            min_cp=VALUES(min_cp),
            min_iv=VALUES(min_iv),
            iv_list=VALUES(iv_list),
            min_lvl=VALUES(min_lvl),
            max_lvl=VALUES(max_lvl),
            gender=VALUES(gender),
            city=VALUES(city)
        `;
        let results = await db.query(sql);
        console.log('[Pokemon] Results:', results);
    }

    static async getAll(guildId, userId) {
        const sql = `
        SELECT id, subscription_id, guild_id, user_id, pokemon_id, form, min_cp, min_iv, iv_list, min_lvl, max_lvl, gender, city
        FROM pokemon
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Pokemon(
                    result.id,
                    result.subscription_id,
                    result.guild_id,
                    result.user_id,
                    result.pokemon_id,
                    result.form,
                    result.min_cp,
                    result.min_iv,
                    JSON.parse(result.iv_list || '[]'),
                    result.min_lvl,
                    result.max_lvl,
                    result.gender,
                    JSON.parse(result.city || '[]'),
                ));
            });
            return list;
        }
        return null;
    }

    static async getByPokemon(guildId, userId, pokemonId, form) {
        const sql = `
        SELECT id, subscription_id, guild_id, user_id, pokemon_id, form, min_cp, min_iv, iv_list, min_lvl, max_lvl, gender, city
        FROM pokemon
        WHERE guild_id = ? AND user_id = ? AND pokemon_id = ? AND form = ?
        `;
        const args = [guildId, userId, pokemonId, form];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Pokemon(
                result.id,
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.pokemon_id,
                result.form,
                result.min_cp,
                result.min_iv,
                JSON.parse(result.iv_list || '[]'),
                result.min_lvl,
                result.max_lvl,
                result.gender,
                JSON.parse(result.city || '[]'),
            );
        }
        return null;
    }
    
    static async getById(id) {
        const sql = `
        SELECT id, subscription_id, guild_id, user_id, pokemon_id, form, min_cp, min_iv, iv_list, min_lvl, max_lvl, gender, city
        FROM pokemon
        WHERE id = ?
        `;
        const args = [id];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Pokemon(
                result.id,
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.pokemon_id,
                result.form,
                result.min_cp,
                result.min_iv,
                JSON.parse(result.iv_list || '[]'),
                result.min_lvl,
                result.max_lvl,
                result.gender,
                JSON.parse(result.city || '[]'),
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
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM pokemon
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const result = await db.query(sql, args);
        return result.affectedRows > 0;
    }

    static async save(id, guildId, userId, pokemonId, form, minCP, minIV, ivList, minLvl, maxLvl, gender, city) {
        const sql = `
        UPDATE pokemon
        SET pokemon_id = ?, form = ?, min_cp = ?, min_iv = ?, iv_list = ?, min_lvl = ?, max_lvl = ?, gender = ?, city = ?
        WHERE guild_id = ? AND user_id = ? AND id = ?
        `;
        const args = [
            pokemonId,
            form,
            minCP,
            minIV,
            JSON.stringify(ivList),
            minLvl,
            maxLvl,
            gender,
            JSON.stringify(city),
            guildId,
            userId,
            id
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    toSql() {
        return `
        (
            ${this.id || 0},
            ${this.subscriptionId},
            ${this.guildId},
            ${this.userId},
            ${this.pokemonId},
            ${this.form ? '"' + this.form + '"' : '""'},
            ${this.minCP},
            ${this.minIV},
            '${JSON.stringify(this.ivList)}',
            ${this.minLvl},
            ${this.maxLvl},
            '${this.gender}',
            '${JSON.stringify(this.city)}'
        )
        `;
    }
}

module.exports = Pokemon;