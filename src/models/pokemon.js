'use strict';

const { DataTypes, Model, Op, } = require('sequelize');
const sequelize = require('../services/sequelize.js');

class Pokemon extends Model {

    static fromPokemonFields = [
        //'id',
        'guildId',
        'userId',
        'subscriptionId',
        'pokemonId',
        'form',
        'minCp',
        'minIv',
        'ivList',
        'minLvl',
        'maxLvl',
        'gender',
        'city',
    ];

    static getCount(guildId, userId) {
        return Pokemon.count({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static async create(pokemon) {
        if (pokemon.length === 0) {
            return;
        }
        const results = await Pokemon.bulkCreate(pokemon, {
            updateOnDuplicate: Pokemon.fromPokemonFields,
        });
        console.log('[Pokemon] Results:', results);
    }

    static getAll(guildId, userId) {
        return Pokemon.findAll({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getByPokemon(guildId, userId, pokemonId, form) {
        return Pokemon.findOne({
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
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
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
    ivList: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '[]',
        get() {
            var data = this.getDataValue('ivList');
            return Array.isArray(data)
                ? data
                : JSON.parse(data || '[]');
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
            return Array.isArray(data)
                ? data
                : JSON.parse(data || '[]');
        },
        /*
        set(val) {
            this.setDataValue('city', JSON.stringify(val || []));
        }
        */
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