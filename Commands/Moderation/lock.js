const { CommandInteraction, MessageEmbed } = require('discord.js');
const DB = require('../../Structures/Schemas/Lockdown');
const ms = require('ms');

module.exports = {
    name: 'lock',
    description: 'Locks a channel for a certain amount of time.',
    usage: 'lock [time] [reason]',
    permission: 'MANAGE_CHANNELS',
    options: [
        {
            name: 'time',
            description: 'The amount of time to lock the channel for.',
            type: 'STRING',
        },
        {
            name: 'reason',
            description: 'The reason for locking the channel.',
            type: 'STRING',
        },
    ],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { channel, author, guild, options } = interaction;

        const Reason = options.getString('reason') || 'No reason provided.';

        const Embed = new MessageEmbed();

        if (!channel.permissionsFor(guild.id).has('SEND_MESSAGES'))
            return interaction.reply({
                embeds: [
                    Embed.setColor(color.error).setDescription(
                        "⛔ | I can't lock that channel, it's already locked."
                    ),
                ],
                ephemeral: true,
            });

        channel.permissionOverwrites.edit(guild.id, {
            SEND_MESSAGES: false,
        });

        const Time = options.getString('time');

        interaction.reply({
            embeds: [
                Embed.setColor(color.error).setDescription(
                    `🔒 | This channel has been in lockdown for: ${
                        Time ? Time + ' - ' : ''
                    }${Reason}`
                ),
            ],
        });

        if (Time) {
            const ExpireDate = Date.now() + ms(Time);
            DB.create({
                GuildID: guild.id,
                ChannelID: channel.id,
                ExpireDate: ExpireDate,
            });

            setTimeout(async () => {
                channel.permissionOverwrites.edit(guild.id, {
                    SEND_MESSAGES: null,
                });
                interaction
                    .editReply({
                        embeds: [
                            Embed.setColor(color.success).setDescription(
                                `🔓 | The lockdown has been lifted.`
                            ),
                        ],
                    })
                    .catch(() => {});
                await DB.deleteOne({ ChannelID: channel.id });
            }, ms(Time));
        }
    },
};
