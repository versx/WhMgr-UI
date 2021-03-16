'use strict';

const { DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../../services/sequelize.js')(false);

class PokestopQuest extends Model {

    static getAll() {
        const quests = PokestopQuest.findAll({
            where: {
                questType: {
                    [Op.not]: null,
                }
            }
        });
        // TODO: Parse quest rewards
        return quests;
    }
}

PokestopQuest.init({
    id: {
        type: DataTypes.STRING(35),
        primaryKey: true,
    },
    questType: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        defaultValue: null,
    },
    questTimestamp: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        defaultValue: null,
    },
    questTarget: {
        type: DataTypes.SMALLINT(6).UNSIGNED,
        defaultValue: null,
    },
    questRewards: {
        type: DataTypes.JSON,
        defaultValue: null,
    },
    questTemplate: {
        type: DataTypes.STRING(100),
        defaultValue: null,
    },
    questRewardType: {
        type: DataTypes.SMALLINT(6).UNSIGNED,
        defaultValue: null,
    },
    questItemId: {
        type: DataTypes.SMALLINT(6).UNSIGNED,
        defaultValue: null,
    },
}, {
    sequelize,
    timestamps: false,
    underscored: true,
    tableName: 'pokestop',
});

module.exports = PokestopQuest;