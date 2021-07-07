'use strict';

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);
const { parseJsonColumn } = require('../services/utils.js');

class Quest extends Model {

    static getCount(guildId, userId) {
        return Quest.count({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getAll(guildId, userId) {
        return Quest.findAll({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getById(id) {
        return Quest.findByPk(id);
    }

    static getBy(guildId, userId, pokestopName, reward) {
        return Quest.findOne({
            where: {
                guildId: guildId,
                userId: userId,
                pokestopName: pokestopName,
                reward: reward,
            }
        });
    }

    static getByReward(guildId, userId, reward) {
        return Quest.findOne({
            where: {
                guildId: guildId,
                userId: userId,
                reward: reward,
            }
        });
    }

    static delete(guildId, userId, pokemonId, form) {
        return Quest.destroy({
            where: {
                guildId: guildId,
                userId: userId,
                pokemonId: pokemonId,
                form: form,
            }
        });
    }

    static deleteById(id) {
        return Quest.destroy({
            where: {
                id: id,
            }
        });
    }

    static deleteAll(guildId, userId) {
        return Quest.destroy({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }
}

Quest.init({
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
        allowNull: true,
    },
    reward: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    city: {
        type: DataTypes.JSONTEXT,
        allowNull: false,
        defaultValue: '[]',
        get() {
            const data = this.getDataValue('city');
            return parseJsonColumn(data);
        }
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
            name: 'FK_quest_subscriptions_subscription_id',
            fields: ['subscription_id'],
        },
    ],
    tableName: 'quests',
});

module.exports = Quest;