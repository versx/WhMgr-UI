'use strict';

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../services/sequelize.js')(true);

class Session extends Model {

    static getAll() {
        return Session.findAll({
            where: {
            }
        });
    }

    /*
    static isValidSession = async (userId) => {
        let sql = `
        SELECT session_id
        FROM ${dbSelection.sessionTable}
        WHERE
            json_extract(data, '$.user_id') = ?
            AND expires >= UNIX_TIMESTAMP()
        `;
        let args = [userId];
        let results = await db.query(sql, args);
        return results.length <= config.maxSessions;
    };
    
    static clearOtherSessions = async (userId, currentSessionId) => {
        return Session.destroy({
            where: {
                data: []
            }
        })
        let sql = `
        DELETE FROM ${dbSelection.sessionTable}
        WHERE
            json_extract(data, '$.user_id') = ?
            AND session_id != ?
        `;
        let args = [userId, currentSessionId];
        let results = await db.query(sql, args);
        console.log('[Session] Clear Result:', results);
    };
    */
}

Session.init({
    session_id: {
        type: DataTypes.STRING(128),
        primaryKey: true,
    },
    expires: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        defaultValue: 0,
    },
    data: {
        type: DataTypes.JSON,
        allowNull: false,
    },
}, {
    sequelize,
    timestamps: false,
    underscored: true,
    tableName: 'sessions',
});

module.exports = Session;