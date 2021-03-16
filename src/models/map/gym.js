'use strict';

const { DataTypes, Model, /*Op,*/ } = require('sequelize');
const sequelize = require('../../services/sequelize.js')(false);

class Gym extends Model {

    static getAll() {//minLat, minLon, maxLat, maxLon) {
        return Gym.findAll();
        /*
        return Gym.findAll({
            where: {
                lat:{
                    [Op.gte]: [minLat],
                    [Op.lte]: [maxLat],
                },
                lon: {
                    [Op.gte]: [minLon],
                    [Op.lte]: [maxLon],
                },
            }
        });
        */
    }
}

Gym.init({
    id: {
        type: DataTypes.STRING(64),
        primaryKey: true,
    },
    lat: {
        type: DataTypes.DOUBLE(18, 14),
        allowNull: false,
        defaultValue: 0,
    },
    lon: {
        type: DataTypes.DOUBLE(18, 14),
        allowNull: false,
        defaultValue: 0,
    },
    name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
    },
}, {
    sequelize,
    timestamps: false,
    underscored: true,
    tableName: 'gym',
});

module.exports = Gym;