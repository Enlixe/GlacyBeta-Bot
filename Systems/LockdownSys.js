const { Client } = require('discord.js');
const DB = require('../Structures/Schemas/Lockdown');
/**
 * @param {Client} client
 */
module.exports = async (client) => {
    DB.find().then(async (documentsArray) => {
        documentsArray.forEach(async (d) => {
            const channel = client.guilds.cache
                .get(d.GuildID)
                .channels.cache.get(d.ChannelID);
            if (!channel) return;

            const TimeNow = Date.now();
            if (d.Time < TimeNow) {
                channel.permissionOverwrites.edit(d.GuildID, {
                    SEND_MESSAGES: null,
                });
                return await DB.deleteOne({ ChannelID: d.ChannelID });
            }

            const ExpireDate = d.Time - Date.now();

            setTimeout(async () => {
                channel.permissionOverwrites.edit(d.GuildID, {
                    SEND_MESSAGES: null,
                });
                await DB.deleteOne({ ChannelID: d.ChannelID });
            }, ExpireDate);
        });
    });
};
