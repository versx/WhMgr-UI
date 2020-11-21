'use strict';
const config = require('../config.json');
const MySQLConnector = require('../services/mysql.js');
const db = new MySQLConnector(config.db.brock);

class Raid {
    constructor(id, subscriptionId, guildId, userId, pokemonId, form, city) {
        this.id = id;
        this.subscriptionId = subscriptionId;
        this.guildId = guildId;
        this.userId = userId;
        this.pokemonId = pokemonId;
        this.form = form;
        this.city = city;
    }

    static async create(raidSQL) {
        if (raidSQL.length === 0) {
            return;
        }
        let sql = `
        INSERT INTO raids (id, subscription_id, guild_id, user_id, pokemon_id, form, city) VALUES
        `;
        sql += raidSQL.join(',');
        sql += `
        ON DUPLICATE KEY UPDATE
            subscription_id=VALUES(subscription_id),
            guild_id=VALUES(guild_id),
            user_id=VALUES(user_id),
            pokemon_id=VALUES(pokemon_id),
            form=VALUES(form),
            city=VALUES(city)
        `;
        let results = await db.query(sql);
        console.log('[Raid] Results:', results);
    }

    static async getAll(guildId, userId) {
        const sql = `
        SELECT id, subscription_id, guild_id, user_id, pokemon_id, form, city
        FROM raids
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Raid(
                    result.id,
                    result.subscription_id,
                    result.guild_id,
                    result.user_id,
                    result.pokemonId,
                    result.form,
                    JSON.parse(result.city || '[]'),
                ));
            });
            return list;
        }
        return null;
    }

    static async getById(id) {
        const sql = `
        SELECT id, subscription_id, guild_id, user_id, pokemon_id, form, city
        FROM raids
        WHERE id = ?
        `;
        const args = [id];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Raid(
                result.id,
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.pokemon_id,
                result.form,
                JSON.parse(result.city || '[]'),
            );
        }
        return null;
    }

    static async getByPokemon(guildId, userId, pokemonId, form) {
        const sql = `
        SELECT id, subscription_id, guild_id, user_id, pokemon_id, form, city
        FROM raids
        WHERE guild_id = ? AND user_id = ? AND pokemon_id = ? AND (form = ? OR form IS NULL)
        LIMIT 1
        `;
        const args = [guildId, userId, pokemonId, form];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            let result = results[0];
            return new Raid(
                result.id,
                result.subscription_id,
                result.guild_id,
                result.user_id,
                result.pokemon_id,
                result.form,
                JSON.parse(result.city || '[]'),
            );
        }
        return null;
    }

    static async delete(guildId, userId, pokemonId, form) {
        const sql = `
        DELETE FROM raids
        WHERE guild_id = ? AND user_id = ? AND pokemon_id = ? AND form = ?
        `;
        const args = [guildId, userId, pokemonId, form];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async deleteById(id) {
        const sql = `
        DELETE FROM raids
        WHERE id = ?
        `;
        const args = [id];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }
    
    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM raids
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const result = await db.query(sql, args);
        return result.affectedRows > 0;
    }

    async save() {
        const sql = `
        UPDATE raids
        SET pokemon_id = ?, form = ?, city = ?
        WHERE guild_id = ? AND user_id = ? AND id = ?
        `;
        const args = [
            this.pokemonId,
            this.form,
            JSON.stringify(this.city),
            this.guildId,
            this.userId,
            this.id,
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
            '${JSON.stringify(this.city)}'
        )
        `;
    }
}

module.exports = Raid;