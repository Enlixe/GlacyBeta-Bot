const { ButtonInteraction } = require('discord.js');
const DB = require('../../Structures/Schemas/SuggestDB');

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.member.permissions.has('ADMINISTRATOR'))
            return interaction.reply({
                content: "You don't have permission to use this command.",
                ephemeral: true,
            });

        const { guildId, customId, message } = interaction;

        if (!['suggest-accept', 'suggest-decline'].includes(customId)) return;
        DB.findOne(
            { GuildID: guildId, MessageID: message.id },
            async (err, data) => {
                if (err) throw err;
                if (!data)
                    return interaction.reply({
                        content: 'No data found in the database.',
                        ephemeral: true,
                    });

                const embed = message.embeds[0];
                if (!embed) return;

                switch (customId) {
                    case 'suggest-accept':
                        embed.fields[2] = {
                            name: 'Status',
                            value: '🟢 | Accepted',
                            inline: true,
                        };
                        message.edit({
                            embeds: [embed.setColor(color.success)],
                            components: [],
                        });
                        return interaction.reply({
                            content: 'Suggestion accepted.',
                            ephemeral: true,
                        });
                    case 'suggest-decline':
                        embed.fields[2] = {
                            name: 'Status',
                            value: '🔴 | Declined',
                            inline: true,
                        };
                        message.edit({
                            embeds: [embed.setColor(color.danger)],
                            components: [],
                        });
                        return interaction.reply({
                            content: 'Suggestion declined.',
                            ephemeral: true,
                        });
                }
            }
        );
    },
};
