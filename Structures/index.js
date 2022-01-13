// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config();
const { Client, Collection } = require('discord.js');
const client = new Client({ intents: 14223, partials: ['CHANNEL'] });

const { promisify } = require('util');
const Ascii = require('ascii-table');
const { glob } = require('glob');
const PG = promisify(glob);
const chalk = require('chalk');

client.commands = new Collection();

// ========================================================
//* Global Variables
global.color = require('./config.json').colors;
global.channels = require('./config.json').channels;
// ========================================================
//* Console Logging With Chalk Colors
log = {
    info: function (message) {
        console.log(
            chalk.white(`[${new Date().toLocaleString()}]`),
            chalk.blue(message)
        );
    },
    log: function (message) {
        console.log(
            chalk.white(`[${new Date().toLocaleString()}]`),
            chalk.green(message)
        );
    },
    warn: function (message) {
        console.log(
            chalk.white(`[${new Date().toLocaleString()}]`),
            chalk.yellow(message)
        );
    },
    error: function (message) {
        console.log(
            chalk.white(`[${new Date().toLocaleString()}]`),
            chalk.red(message)
        );
    },
};
log.info('EnlX > Loading EnlX...');
log.info(`EnlX > Version: ${require('../package.json').version}`);
log.info(`EnlX > Author: ${require('../package.json').author}`);
// ========================================================
//* Check for updates on GitHub
log.info('EnlX > Update | Checking for updates...');
const updateLink = 'Enlixe/GlacyBeta-Bot';
const version = require('../package.json').version;
const fetch = require('node-fetch');
fetch(`https://api.github.com/repos/${updateLink}/releases/latest`)
    .then((res) => res.json())
    .then(async (body) => {
        if (body.name > version) {
            log.warn(`EnlX > Update | New update available ! ${body.tag_name}`);
            log.warn(`EnlX > Update | Current Version: v${version}`);
            log.warn(`EnlX > Update | New Version: ${body.tag_name}`);
            log.warn(`EnlX > Update | Download: ${body.zipball_url}`);

            // Git Pull and Restart
            log.info(`EnlX > Update | Pulling latest changes...`);
            const { exec } = require('child_process');
            exec(
                `git pull https://github.com/${updateLink}`,
                (err, stdout, stderr) => {
                    if (err) {
                        log.error(`EnlX > Update | Error: ${err}`);
                        return;
                    }
                    log.info(`EnlX > Update | Pull complete.`);
                    log.info(`EnlX > Update | Restarting...`);
                    process.exit(1);
                }
            );
        } else {
            log.info(
                `EnlX > Update | You are running the latest version of EnlX.`
            );
            log.info(
                `EnlX > Update | Current Version: v${version} - Github Version: ${body.tag_name}`
            );
        }
    })
    .catch((err) => {
        log.error(
            `EnlX > Update | There was an error checking for updates!\n${err}`
        );
    });
// ========================================================
//* Cooldown system
client.cooldown = new Collection();
// ========================================================
//* Maintenance check
client.maintenance = false;
// ========================================================
//* Music System
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');

client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnEmpty: true,
    emitAddSongWhenCreatingQueue: false,
    plugins: [new SpotifyPlugin()],
});
module.exports = client;
// ========================================================
//* Giveaway System
require('../Systems/GiveawaySys')(client);
// ========================================================
//* Events and Commands Handler
['Events', 'Commands'].forEach((handler) => {
    require(`./Handlers/${handler}`)(client, PG, Ascii);
});
// ========================================================

client.login(process.env.TOKEN);
