'use strict';

const { DataTypes, Model, Op, } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);
const { parseJsonColumn } = require('../services/utils.js');

class Pokemon extends Model {

    static getCount(guildId, userId) {
        return Pokemon.count({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getAll(guildId, userId) {
        return Pokemon.findAll({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getByPokemon(guildId, userId, pokemon, form, iv, ivList, minLevel, maxLevel, gender, size) {
        return Pokemon.findOne({
            where: {
                guildId: guildId,
                userId: userId,
                pokemonId: pokemon,
                form: {
                    [Op.or]: [null, form],
                },
                minIv: iv,
                ivList: ivList,
                minLvl: minLevel,
                maxLvl: maxLevel,
                gender: gender,
                size: size,
            }
        });
    }

    static getById(id) {
        return Pokemon.findByPk(id);
    }

    static deleteById(id) {
        return Pokemon.destroy({
            where: {
                id: id,
            }
        });
    }

    static deleteAll(guildId, userId) {
        return Pokemon.destroy({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }
}

Pokemon.init({
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
    form: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    minCp: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
    },
    minIv: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
    },
    minLvl: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
    },
    maxLvl: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 35,
    },
    gender: {
        type: DataTypes.STRING(1),
        allowNull: false,
        defaultValue: '*',
    },
    size: {
        type: DataTypes.STRING(6),
        defaultValue: 'All',
    },
    ivList: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '[]',
        get() {
            var data = this.getDataValue('ivList');
            return parseJsonColumn(data);
        },
        /*
        set(val) {
            this.setDataValue('iv_list', JSON.stringify(val || []));
        }
        */
    },
    city: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '[]',
        get() {
            var data = this.getDataValue('city');
            return parseJsonColumn(data);
        },
        /*
        set(val) {
            this.setDataValue('city', JSON.stringify(val || []));
        }
        */
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
            name: 'FK_pokemon_subscriptions_subscription_id',
            fields: ['subscription_id'],
        },
    ],
    tableName: 'pokemon',
});

// Export the class
module.exports = Pokemon;