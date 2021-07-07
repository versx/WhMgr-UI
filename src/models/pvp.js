'use strict';

const { DataTypes, Model, Op, TEXT, } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);
const { parseJsonColumn } = require('../services/utils.js');

class PVP extends Model {

    static getCount(guildId, userId) {
        return PVP.count({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    static getAll(guildId, userId) {
        return PVP.findAll({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }
    
    static getPokemonByLeague(guildId, userId, pokemon, form, league) {
        return PVP.findOne({
            where: {
                guildId: guildId,
                userId: userId,
                pokemonId: pokemon,
                form: {
                    [Op.or]: [null, form],
                },
                league: league,
            }
        });
    }

    static getById(id) {
        return PVP.findByPk(id);
    }

    static deleteById(id) {
        return PVP.destroy({
            where: {
                id: id,
            }
        });
    }

    static deleteAll(guildId, userId) {
        return PVP.destroy({
            where: {
                guildId: guildId,
                userId: userId,
            }
        });
    }

    /*
    async save() {
        const results = PVP.update({
            pokemonId: this.pokemonId,
            form: this.form,
            league: this.league,
            minRank: this.minRank,
            minPercent: this.minPercent,
            city: this.city,
        }, {
            where: {
                id: this.id,
                //guildId: this.guildId,
                //userId: this.userId,
            }
        });
        return results;
    }
    */
}

PVP.init({
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
        type: DataTypes.JSON,//TEXT(),
        allowNull: false,
        get() {
            var data = this.getDataValue('pokemonId');
            return parseJsonColumn(data);
        },
    },
    form: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    minRank: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 25,
    },
    minPercent: {
        type: DataTypes.DOUBLE(),
        allowNull: false,
        defaultValue: 90,
    },
    league: {
        type: DataTypes.STRING(255),
        allowNull: false,
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
            name: 'FK_pvp_subscriptions_subscription_id',
            fields: ['subscription_id'],
        },
    ],
    tableName: 'pvp',
});

module.exports = PVP;