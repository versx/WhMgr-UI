'use strict';

const { DataTypes, Model, } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);

class Metadata extends Model {

    static create = async (key, value) => await Metadata.create(key, value);

    static getAll = () => Metadata.findAll();

    static getByKey = (key) => Metadata.findByPk(key);

    static async update(key, value) {
        await Metadata.upsert({
            key: key,
            value: value,
        });
    }

    static deleteById(key) {
        return Metadata.destroy({
            where: { key },
        });
    }

    static deleteAll = () => Metadata.destroy();
}

Metadata.init({
    key: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
    },
    value: {
        type: DataTypes.TEXT(),
    },
}, {
    sequelize,
    timestamps: false,
    underscored: true,
    tableName: 'metadata',
});

module.exports = Metadata;