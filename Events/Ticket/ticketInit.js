const {
    ButtonInteraction,
    MessageActionRow,
    MessageEmbed,
    MessageButton,
} = require('discord.js');
const DB = require('../../Structures/Schemas/Ticket');
const TicketSetupData = require('../../Structures/Schemas/TicketSetup');

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.isButton()) return;
        const { guild, member, customId } = interaction;

        const Data = await TicketSetupData.findOne({ GuildID: guild.id });
        if (!Data) return;
        if (!Data.Buttons.includes(customId)) return;

        //* Return if there is exist
        const exist = await DB.findOne({
            GuildID: guild.id,
            MembersID: {
                $in: member.id,
            },
            Closed: false,
        });
        if (exist)
            return interaction.reply({
                content: `${member} You have a ticket open already`,
                ephemeral: true,
            });

        const ID = Math.floor(Math.random() * 90000) + 10000;

        await guild.channels
            .create(`${customId + `-${interaction.user.username}-` + ID}`, {
                type: 'GUILD_TEXT',
                parent: Data.Category,
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: [
                            'SEND_MESSAGES',
                            'VIEW_CHANNEL',
                            'READ_MESSAGE_HISTORY',
                        ],
                    },
                    {
                        id: Data.Handlers,
                        allow: [
                            'SEND_MESSAGES',
                            'VIEW_CHANNEL',
                            'READ_MESSAGE_HISTORY',
                        ],
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [
                            'VIEW_CHANNEL',
                            'SEND_MESSAGES',
                            'READ_MESSAGE_HISTORY',
                        ],
                    },
                ],
            })
            .then(async (channel) => {
                await DB.create({
                    GuildID: guild.id,
                    MembersID: member.id,
                    TicketID: ID,
                    ChannelID: channel.id,
                    Closed: false,
                    Locked: false,
                    Type: customId,
                    Claimed: false,
                });

                const Embed = new MessageEmbed()
                    .setAuthor({
                        name: `${guild.name} | Ticket: ${ID}`,
                        iconURL: member.user.displayAvatarURL({
                            dynamic: true,
                        }),
                    })
                    .setDescription(
                        `Hello there, \n The staff will be here as soon as possible  meanwhile tell us about your issue!\nThank You!`
                    )
                    .setFooter({ text: `The buttons below are STAFF ONLY` });

                const Buttons = new MessageActionRow();
                Buttons.addComponents(
                    new MessageButton()
                        .setCustomId('close')
                        .setLabel('Save & Close Ticket')
                        .setStyle('PRIMARY')
                        .setEmoji('💾'),
                    new MessageButton()
                        .setCustomId('lock')
                        .setLabel('Lock')
                        .setStyle('SECONDARY')
                        .setEmoji('🔒'),
                    new MessageButton()
                        .setCustomId('unlock')
                        .setLabel('Unlock')
                        .setStyle('SECONDARY')
                        .setEmoji('🔓'),
                    new MessageButton()
                        .setCustomId('claim')
                        .setLabel('Claim')
                        .setStyle('PRIMARY')
                        .setEmoji('✋')
                );

                channel.send({
                    embeds: [Embed],
                    components: [Buttons],
                });

                channel
                    .send({
                        content: `${member} here is your ticket`,
                    })
                    .then((m) => {
                        setTimeout(() => {
                            m.delete().catch(() => {});
                        }, 5 * 1000);
                    });

                interaction.reply({
                    content: `${member} your ticket has been created: ${channel}`,
                    ephemeral: true,
                });
            });
    },
};
