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

const NotificationStatusType = {
    None: 0x0,
    Pokemon: 0x1,
    PvP: 0x2,
    Raids: 0x4,
    Quests: 0x8,
    Invasions: 0x10,
    Lures: 0x20,
    Gyms: 0x40,
    /*
    All: this.Pokemon
        | this.PvP
        | this.Raids
        | this.Quests
        | this.Invasions
        | this.Lures
        | this.Gyms,
    */
};
NotificationStatusType.All = NotificationStatusType.Pokemon
    | NotificationStatusType.PvP
    | NotificationStatusType.Raids
    | NotificationStatusType.Quests
    | NotificationStatusType.Invasions
    | NotificationStatusType.Lures
    | NotificationStatusType.Gyms;

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

    static updateSubscription(guildId, userId, status, location, iconStyle, phoneNumber) {
        return Subscription.update({
            status: status,
            location: location || null,
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

    isEnabled(status) {
        return (this.status & status) === status;
    }

    enableNotificationType(status) {
        this.status |= status;
    }

    disableNotificationType(status) {
        this.status &= (~status);
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
    /*
    enabled: {
        type: DataTypes.TINYINT(1).UNSIGNED,
        allowNull: false,
        defaultValue: 1,
    },
    */
    status: {
        type: DataTypes.SMALLINT(5).UNSIGNED,
        require: true,
        defaultValue: NotificationStatusType.All,
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
    location: {
        type: DataTypes.STRING(32),
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
module.exports = { Subscription, NotificationStatusType, };
