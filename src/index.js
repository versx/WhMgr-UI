'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const mustacheExpress = require('mustache-express');
const helmet = require('helmet');
const i18n = require('i18n');

const config = require('./config.json');
const defaultData = require('./data/default.js');
const apiRoutes = require('./routes/api.js');
const discordRoutes = require('./routes/discord.js');
const uiRoutes = require('./routes/ui.js');
const utils = require('./services/utils.js');


run();

async function run() {
    // Basic security protections
    app.use(helmet());

    // View engine
    app.set('view engine', 'mustache');
    app.set('views', path.resolve(__dirname, 'views'));
    app.engine('mustache', mustacheExpress());

    // Static paths
    app.use(express.static(path.resolve(__dirname, '../static')));
    
    // Body parser middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: false, limit: '50mb' }));

    // Initialize localzation handler
    i18n.configure({
        locales:['en', 'es', 'de'],
        directory: path.resolve(__dirname, '../static/locales')
    });
    app.use(i18n.init);
    
    // Register helper as a locals function wrroutered as mustache expects
    app.use(function(req, res, next) {
        // Mustache helper
        res.locals.__ = function() {
            /* eslint-disable no-unused-vars */
            return function(text, render) {
            /* eslint-enable no-unused-vars */
                return i18n.__.routerly(req, arguments);
            };
        };
        next();
    });
    
    // Set locale
    i18n.setLocale(config.locale);

    // Sessions middleware
    app.use(session({
        secret: utils.generateString(),
        resave: true,
        saveUninitialized: true
    }));

    if (config.discord.enabled) {
        app.use('/api/discord', discordRoutes);

        // Discord error middleware
        /* eslint-disable no-unused-vars */
        app.use(function(err, req, res, next) {
        /* eslint-enable no-unused-vars */
            switch (err.message) {
            case 'NoCodeProvided':
                return res.status(400).send({
                    status: 'ERROR',
                    error: err.message,
                });
            default:
                return res.status(500).send({
                    status: 'ERROR',
                    error: err.message,
                });
            }
        });
    }
    
    // Login middleware
    app.use(function(req, res, next) {
        if (config.discord.enabled && (req.path === '/api/discord/login' || req.path === '/login')) {
            return next();
        }
        if (!config.discord.enabled || req.session.logged_in) {
            const data = defaultData;
            data.logged_in = true;
            data.username = req.session.username || 'root';
            data.guild_id = '342025055510855680';
            data.user_id = '266771160253988875';
            return next();
        }
        res.redirect('/login');
    });

    // API routes
    app.use('/api', apiRoutes);

    // UI routes
    app.use('/', uiRoutes);

    // Start listener
    app.listen(config.port, config.interface, () => console.log(`Listening on port ${config.port}...`));
}