'use strict';

const mysql = require('mysql');
const config = require('../config.json');

function getConnection() {
    const conn = mysql.createConnection({
        host: config.db.scanner.host,
        port: config.db.scanner.port,
        user: config.db.scanner.username,
        password: config.db.scanner.password,
        database: config.db.scanner.database,
        charset: config.db.scanner.charset
    });
    
    conn.connect(function(err) {
        if (err) {
            console.log('Error connecting to database');
            return;
        }
    });
    
    conn.on('error', function(err) {
        console.error('Mysql error:', err);
    });
    return conn;
}

function query(sql, args) {
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err) on catch.
        const conn = getConnection();
        /* eslint-disable no-unused-vars */
        conn.query(sql, args, function(err, rows, fields) {
        /* eslint-enable no-unused-vars */
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows);
            conn.end(function(err, args) {
                if (err) {
                    console.error('Failed to close mysql connection:', args);
                    return;
                }
            });
        });
    });
}

module.exports = query;