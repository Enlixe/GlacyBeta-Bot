const { MessageEmbed, CommandInteraction } = require('discord.js');
const DB = require(`../../Structures/Schemas/Ticket`);

module.exports = {
    name: 'ticket',
    description: 'Creates a ticket.',
    usage: '/ticket',
    permissions: ['ADMINISTRATOR'],
    options: [
        {
            name: 'action',
            type: 'STRING',
            description: 'Add or Remove a member from this ticket.',
            required: true,
            choices: [
                { name: 'Add', value: 'add' },
                { name: 'Remove', value: 'remove' },
            ],
        },
        {
            name: 'member',
            type: 'USER',
            description: 'Select a member to add or remove.',
            required: true,
        },
    ],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guildId, options, channel } = interaction;

        const action = options.getString('action');
        const member = options.getMember('member');
        const embed = new MessageEmbed();

        switch (action) {
            case 'add':
                DB.findOne(
                    { GuildID: guildId, ChannelID: channel.id },
                    async (err, docs) => {
                        if (err) throw err;
                        if (!docs)
                            return interaction.reply({
                                embeds: [
                                    embed
                                        .setColor(color.error)
                                        .setDescription(
                                            '⛔ | This channel is not tied with a ticket.'
                                        ),
                                ],
                                ephemeral: true,
                            });
                        if (docs.MembersID.includes(member.id))
                            return interaction.reply({
                                embeds: [
                                    embed
                                        .setColor(color.error)
                                        .setDescription(
                                            '⛔ | This member is already in this ticket.'
                                        ),
                                ],
                                ephemeral: true,
                            });

                        docs.MembersID.push(member.id);
                        channel.permissionOverwrites.edit(member.id, {
                            VIEW_CHANNEL: true,
                            SEND_MESSAGES: true,
                            READ_MESSAGE_HISTORY: true,
                        });
                        interaction.reply({
                            embeds: [
                                embed
                                    .setColor(color.success)
                                    .setDescription(
                                        `✅ | ${member} has been added to this ticket.`
                                    ),
                            ],
                        });
                        docs.save();
                    }
                );
                break;
            case 'remove':
                DB.findOne(
                    { GuildID: guildId, ChannelID: channel.id },
                    async (err, docs) => {
                        if (err) throw err;
                        if (!docs)
                            return interaction.reply({
                                embeds: [
                                    embed
                                        .setColor(color.error)
                                        .setDescription(
                                            '⛔ | This channel is not tied with a ticket.'
                                        ),
                                ],
                                ephemeral: true,
                            });
                        if (!docs.MembersID.includes(member.id))
                            return interaction.reply({
                                embeds: [
                                    embed
                                        .setColor(color.error)
                                        .setDescription(
                                            '⛔ | This member is not in this ticket.'
                                        ),
                                ],
                                ephemeral: true,
                            });

                        docs.MembersID.remove(member.id);
                        channel.permissionOverwrites.edit(member.id, {
                            VIEW_CHANNEL: false,
                        });
                        interaction.reply({
                            embeds: [
                                embed
                                    .setColor(color.success)
                                    .setDescription(
                                        `✅ | ${member} has been removed from this ticket.`
                                    ),
                            ],
                        });
                        docs.save();
                    }
                );
                break;
        }
    },
};
