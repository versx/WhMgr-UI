'use strict';

const { DataTypes, Model, } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);
const { parseJsonColumn } = require('../services/utils.js');

class Invasion extends Model {

    static getCount(guildId, userId) {
        return Invasion.count({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getAll(guildId, userId) {
        return Invasion.findAll({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getById(id) {
        return Invasion.findByPk(id);
    }

    static getBy(guildId, userId, pokestopName, gruntType, rewardPokemonIds) {
        return Invasion.findOne({
            where: {
                guildId: guildId,
                userId: userId,
                pokestopName: pokestopName,
                gruntType: gruntType,
                rewardPokemonId: rewardPokemonIds,
            }
        });
    }

    static delete(guildId, userId, rewardPokemonId) {
        return Invasion.destroy({
            where: {
                guildId: guildId,
                userId: userId,
                rewardPokemonId: rewardPokemonId,
            }
        });
    }

    static deleteById(id) {
        return Invasion.destroy({
            where: {
                id: id,
            }
        });
    }

    static deleteAll(guildId, userId) {
        return Invasion.destroy({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }
}

Invasion.init({
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
    pokestopName: {
        type: DataTypes.STRING(128),
        allowNull: true,
        //unique: true,
    },
    gruntType: {
        type: DataTypes.JSON,
        defaultValue: null,
        get() {
            var data = this.getDataValue('gruntType');
            return parseJsonColumn(data);
        },
    },
    rewardPokemonId: {
        type: DataTypes.JSON,
        defaultValue: null,
        get() {
            var data = this.getDataValue('rewardPokemonId');
            return parseJsonColumn(data);
        },
    },
    city: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '[]',
        get() {
            var data = this.getDataValue('city');
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
            name: 'FK_invasion_subscriptions_subscription_id',
            fields: ['subscription_id'],
        },
    ],
    tableName: 'invasions',
});

module.exports = Invasion;