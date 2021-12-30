const { CommandInteraction, MessageEmbed } = require('discord.js');
const DB = require('../../Structures/Schemas/PremiumModel');
const { colors, channels } = require('../../Structures/config.json');

// Change to your id here
const owner = require('../../Structures/config.json').devs;

module.exports = {
    name: 'premium',
    description: 'Get premium features.',
    permission: 'ADMINISTRATOR',
    options: [
        {
            name: 'add',
            description: 'Add guild to premium list.',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'guild',
                    description: 'Enter guild id',
                    type: 'STRING',
                    required: true,
                },
            ],
        },
        {
            name: 'redeem',
            description: 'Redeem premium.',
            type: 'SUB_COMMAND',
        },
        {
            name: 'remove',
            description: 'Remove guild from premium list.',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'guild',
                    description: 'Enter guild id',
                    type: 'STRING',
                    required: true,
                },
            ],
        },
    ],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { options, guild, client, user } = interaction;
        const guildId = options.getString('guild');

        const Logs = guild.channels.cache.get(channels.log);

        // Gets guild name from id
        const guildIds = client.guilds.cache.get(guildId);

        try {
            switch (options.getSubcommand()) {
                case 'add': {
                    if (!owner.includes(interaction.member.id))
                        return interaction.reply({
                            content: 'You are not allowed to use this command!',
                            ephemeral: true,
                        });
                    const guildNames = guildIds.name;
                    await DB.findOne(
                        { GuildID: guildId },
                        async (err, data) => {
                            if (err) throw err;

                            if (data == null) {
                                await DB.findOneAndUpdate(
                                    {
                                        GuildID: guildId,
                                        GuildName: guildNames,
                                        Redeemed: false,
                                    },
                                    {
                                        GuildID: guildId,
                                        GuildName: guildNames,
                                        Redeemed: false,
                                    },
                                    { upsert: true }
                                );
                                return interaction.reply({
                                    content: `Added ${guildNames} to premium list.`,
                                    ephemeral: true,
                                });
                            }

                            if (data.GuildID == guildId) {
                                if (data.Redeemed == true)
                                    return interaction.reply({
                                        content: `This server is already in the premium list!\n\n Status: **Claimed**`,
                                        ephemeral: true,
                                    });

                                if (data.Redeemed == false)
                                    return interaction.reply({
                                        content: `This server is already in the premium list!\n\n Status: **Not claimed**`,
                                        ephemeral: true,
                                    });
                            }
                        }
                    );
                }
                case 'redeem': {
                    await DB.findOne(
                        { GuildID: guild.id },
                        async (err, data) => {
                            if (err) throw err;
                            if (!data || data == null)
                                return interaction.reply({
                                    content:
                                        'This server is not on the premium list.',
                                    ephemeral: true,
                                });
                            if (data.Redeemed == true)
                                return interaction.reply({
                                    content:
                                        'This server has already redeemed premium!',
                                    ephemeral: true,
                                });

                            if (data) {
                                // Updates name if the server decides to change name
                                await DB.updateOne(
                                    { GuildID: guild.id },
                                    { GuildName: guild.name, Redeemed: true }
                                );

                                const RedeemEmbed = new MessageEmbed()
                                    .setTitle(`Redeemed premium`)
                                    .setColor('PURPLE')
                                    .addField(
                                        `Redeemer`,
                                        `${interaction.user.tag}`
                                    )
                                    .addField(`Guild`, `${data.GuildName}`)
                                    .setImage(
                                        `${guild.iconURL({ dynamic: true })}`
                                    )
                                    .setThumbnail(
                                        `${user.displayAvatarURL({
                                            dynamic: true,
                                        })}`
                                    )
                                    .setTimestamp();

                                Logs.send({ embeds: [RedeemEmbed] });
                                return interaction.reply({
                                    embeds: [RedeemEmbed]
                                });
                            }
                        }
                    );
                }
                case 'remove': {
                    if (!owner.includes(interaction.member.id))
                        return interaction.reply({
                            content: 'You are not allowed to use this command!',
                            ephemeral: true,
                        });
                    guildNames = guildIds.name;
                    await DB.deleteOne({ GuildID: guildId });
                    return interaction.reply({
                        content: `Removed ${guildNames} from premium list.`,
                        ephemeral: true,
                    });
                }
            }
        } catch (error) {
            // Note: You will get a database error (MongooseError: Query was already executed:) just ignore it, the bot still works fine.
            const errorEmbed = new MessageEmbed()
                .setColor(colors.error)
                .setDescription(`⛔ Alert: ${error}`);

            Logs.send({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
