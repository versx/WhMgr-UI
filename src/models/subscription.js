'use strict';

const { DataTypes, Model, } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);

/*
const Pokemon = require('./pokemon.js');
const PVP = require('./pvp.js');
const Raid = require('./raid.js');
const Quest = require('./quest.js');
const Invasion = require('./invasion.js');
const Gym = require('./gym.js');
*/

class Subscription extends Model {
  
    static async createUserSubscription(guildId, userId) {
        const subscription = Subscription.build({
            id: 0,
            guildId: guildId,
            userId: userId,
        });
        const results = await subscription.save();
        return results;
    }

    static updateSubscription(guildId, userId, enabled, distance, latitude, longitude, iconStyle, phoneNumber) {
        return Subscription.update({
            enabled: enabled,
            distance: distance || 0,
            latitude: latitude || 0,
            longitude: longitude || 0,
            iconStyle: iconStyle || 'Default',
            phoneNumber: phoneNumber || null,
        }, {
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static async getSubscription(guildId, userId) {
        const existing = await Subscription.findOne({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
        if (!existing) {
            return await this.createUserSubscription(guildId, userId);
        }
        return existing;
    }
}

Subscription.init({
    id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    guildId: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    userId: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    enabled: {
        type: DataTypes.TINYINT(1).UNSIGNED,
        allowNull: false,
        defaultValue: 1,
    },
    distance: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
    },
    latitude: {
        type: DataTypes.DOUBLE(18, 14),
        allowNull: false,
        defaultValue: 0,
    },
    longitude: {
        type: DataTypes.DOUBLE(18, 14),
        allowNull: false,
        defaultValue: 0,
    },
    iconStyle: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'Default',
    },
    phoneNumber: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize,
    timestamps: false,
    underscored: true,
    tableName: 'subscriptions',
});

/*
//Pokemon.Subscription = Pokemon.belongsTo(Subscription);
Subscription.Pokemon = Subscription.hasMany(Pokemon);
Subscription.PVP = Subscription.hasMany(PVP);
Subscription.Raids = Subscription.hasMany(Raid);
Subscription.Quests = Subscription.hasMany(Quest);
Subscription.Invasions = Subscription.hasMany(Invasion);
Subscription.Gyms = Subscription.hasMany(Gym);
*/

// Export the class
module.exports = Subscription;