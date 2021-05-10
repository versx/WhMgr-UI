'use strict';

const { DataTypes, Model, } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);

class Location extends Model {

    static getCount(guildId, userId) {
        return Location.count({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getAllByUserId(userId) {
        return Location.findAll({
            where: {
                userId: userId,
            }
        });
    }

    static getAll(guildId, userId) {
        return Location.findAll({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getByName(guildId, userId, name) {
        return Location.findOne({
            where: {
                guildId: guildId,
                userId: userId,
                name: name,
            }
        });
    }
    
    static getById(id) {
        return Location.findByPk(id);
    }

    static delete(guildId, userId, name) {
        return Location.destroy({
            where: {
                guildId: guildId,
                userId: userId,
                name: name,
            }
        });
    }

    static deleteById(id) {
        return Location.destroy({
            where: {
                id: id,
            }
        });
    }

    static deleteAll(guildId, userId) {
        return Location.destroy({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }
}

Location.init({
    id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        defaultValue: 0,
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
    name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
    },
    distance: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
    },
    latitude: {
        type: DataTypes.DOUBLE(18, 14),
        defaultValue: 0,
    },
    longitude: {
        type: DataTypes.DOUBLE(18, 14),
        defaultValue: 0,
    },
}, {
    sequelize,
    timestamps: false,
    underscored: true,
    indexes: [
        {
            name: 'FK_location_subscriptions_subscription_id',
            fields: ['subscription_id'],
        },
    ],
    tableName: 'locations',
});

module.exports = Location;