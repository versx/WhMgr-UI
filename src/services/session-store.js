'use strict';

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const config = require('../config.json');

// MySQL session store
const sessionStore = new MySQLStore({
    // Database server IP address/hostname
    host: config.db.main.host,
    // Database server listening port
    port: config.db.main.port,
    // Database username
    user: config.db.main.username,
    // Password for the above database user
    password: config.db.main.password,
    // Database name to save sessions table to
    database: config.db.main.database,
    // Whether or not to automatically check for and clear expired sessions:
    clearExpired: true,
    // How frequently expired sessions will be cleared; milliseconds:
    checkExpirationInterval: 900000,
    // Whether or not to create the sessions database table, if one does not already exist
    createDatabaseTable: true,
    // Set Sessions table name
    schema: {
        tableName: "sessions",
    }
});

module.exports = {
    sessionStore,
};
