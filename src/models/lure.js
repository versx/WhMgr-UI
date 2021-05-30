'use strict';

const { DataTypes, Model, } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);

class Lure extends Model {

    static getCount(guildId, userId) {
        return Lure.count({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static async create(lures) {
        if (lures.length === 0) {
            return;
        }
        const results = await Lure.bulkCreate(lures, {
            updateOnDuplicate: Lure.fromLureFields,
        });
        console.log('[Lure] Results:', results);
    }

    static getAll(guildId, userId) {
        return Lure.findAll({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getById(id) {
        return Lure.findByPk(id);
    }

    static getBy(guildId, userId, pokestopName, lureType) {
        return Lure.findOne({
            where: {
                guildId: guildId,
                userId: userId,
                pokestopName: pokestopName,
                lureType: lureType,
            }
        });
    }

    static delete(guildId, userId, lureType) {
        return Lure.destroy({
            where: {
                guildId: guildId,
                userId: userId,
                lureType: lureType,
            }
        });
    }

    static deleteById(id) {
        return Lure.destroy({
            where: {
                id: id,
            }
        });
    }

    static deleteAll(guildId, userId) {
        return Lure.destroy({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }
}

Lure.init({
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
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    lureType: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
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
            name: 'FK_lure_subscriptions_subscription_id',
            fields: ['subscription_id'],
        },
    ],
    tableName: 'lures',
});

module.exports = Lure;