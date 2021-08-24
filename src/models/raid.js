'use strict';

const { DataTypes, Model, Op, } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);

class Raid extends Model {

    static fromGymFields = [
        //'id',
        'guildId',
        'userId',
        'subscriptionId',
        'pokemonId',
        'form',
        'city',
    ];

    static getCount(guildId, userId) {
        return Raid.count({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static async create(raids) {
        if (raids.length === 0) {
            return;
        }
        const results = await Raid.bulkCreate(raids, {
            updateOnDuplicate: Raid.fromGymFields,
        });
        console.log('[Raid] Results:', results);
    }

    static getAll(guildId, userId) {
        return Raid.findAll({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getById(id) {
        return Raid.findByPk(id);
    }

    static getByPokemon(guildId, userId, pokemonId, form) {
        return Raid.findOne({
            where: {
                guildId: guildId,
                userId: userId,
                pokemonId: pokemonId,
                form: {
                    [Op.or]: [null, form],
                },
            }
        });
    }

    static delete(guildId, userId, pokemonId, form) {
        return Raid.destroy({
            where: {
                guildId: guildId,
                userId: userId,
                pokemonId: pokemonId,
                form: form,
            }
        });
    }

    static deleteById(id) {
        return Raid.destroy({
            where: {
                id: id,
            }
        });
    }

    static deleteAll(guildId, userId) {
        return Raid.destroy({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    async save() {
        const results = Raid.update({
            pokemonId: this.pokemonId,
            form: this.form,
            city: this.city,
        }, {
            where: {
                id: this.id,
                //guildId: this.guildId,
                //userId: this.userId,
            }
        });
        return results;
    }
}

Raid.init({
    id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    subscriptionId: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    guildId: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    userId: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    pokemonId: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
    },
    form: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
    city: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '[]',
        get() {
            var data = this.getDataValue('city');
            return Array.isArray(data)
                ? data
                : JSON.parse(data || '[]');
        },
    },
    location: {
        type: DataTypes.STRING(32),
        defaultValue: null,
    },
}, {
    sequelize,
    timestamps: false,
    underscored: true,
    indexes: [
        {
            name: 'FK_raid_subscriptions_subscription_id',
            fields: ['subscription_id'],
        },
    ],
    tableName: 'raids',
});

module.exports = Raid;