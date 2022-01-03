const {
    CommandInteraction,
    MessageActionRow,
    MessageEmbed,
    MessageButton,
} = require('discord.js');
const DB = require('../../Structures/Schemas/SuggestDB');

module.exports = {
    name: 'suggest',
    description: 'Suggest something to the bot owner.',
    usage: 'suggest <suggestion>',
    permissions: ['ADMINISTRATOR'],
    options: [
        {
            name: 'type',
            description: 'The type of suggestion.',
            type: 'STRING',
            required: true,
            choices: [
                { name: 'Command', value: 'command' },
                { name: 'Event Listener', value: 'event listener' },
                { name: 'System', value: 'system' },
                { name: 'Other', value: 'other' },
            ],
        },
        {
            name: 'suggestion',
            description: 'The suggestion to be made.',
            type: 'STRING',
            required: true,
        },
    ],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { options, guildId, member, user } = interaction;
        const type = options.getString('type');
        const suggestion = options.getString('suggestion');

        const embed = new MessageEmbed()
            .setColor(color.default)
            .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Suggestion', value: suggestion, inline: false },
                { name: 'Type', value: type, inline: true },
                { name: 'Status', value: 'Pending', inline: true }
            )
            .setTimestamp();

        const buttons = new MessageActionRow();
        buttons.addComponents(
            new MessageButton()
                .setCustomId('suggest-accept')
                .setLabel('✅ Accept')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('suggest-decline')
                .setLabel('⛔ Decline')
                .setStyle('DANGER')
        );

        try {
            const M = await interaction.reply({
                embeds: [embed],
                components: [buttons],
                fetchReply: true,
            });

            await DB.create({
                GuildID: guildId,
                MessageID: M.id,
                Details: [
                    {
                        MemberID: member.id,
                        Type: type,
                        Suggestion: suggestion,
                    },
                ],
            });
        } catch (err) {
            log.error(err);
        }
    },
};
