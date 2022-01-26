'use strict';

const { DataTypes, Model, Op, } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);
const { parseJsonColumn } = require('../services/utils.js');

class Raid extends Model {

    static getCount(guildId, userId) {
        return Raid.count({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
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
        type: DataTypes.JSON,
        allowNull: false,
        get() {
            var data = this.getDataValue('pokemonId');
            return parseJsonColumn(data);
        },
        /*
        set(val) {
            this.setDataValue('city', JSON.stringify(val || []));
        }
        */
    },
    forms: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
            var data = this.getDataValue('forms');
            return parseJsonColumn(data);
        },
    },
    exEligible: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    areas: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '[]',
        get() {
            var data = this.getDataValue('areas');
            return parseJsonColumn(data);
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