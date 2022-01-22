const { CommandInteraction, MessageEmbed } = require('discord.js');
const DB = require('../../Structures/Schemas/Lockdown');

module.exports = {
    name: 'unlock',
    description: 'Lift the lockdown on a channel.',
    usage: 'unlock',
    permission: 'MANAGE_CHANNELS',
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { channel, author, guild } = interaction;

        const Embed = new MessageEmbed();

        if (channel.permissionsFor(guild.id).has('SEND_MESSAGES'))
            return interaction.reply({
                embeds: [
                    Embed.setColor(color.error).setDescription(
                        "⛔ | I can't unlock that channel, it's already unlocked."
                    ),
                ],
                ephemeral: true,
            });

        channel.permissionOverwrites.edit(guild.id, {
            SEND_MESSAGES: null,
        });

        if (DB.findOne({ GuildID: guild.id, ChannelID: channel.id }))
            await DB.deleteOne({ ChannelID: channel.id });

        return await interaction.reply({
            embeds: [
                Embed.setColor(color.success).setDescription(
                    '🔓 | Lockdown has been lifted.'
                ),
            ],
        });
    },
};
