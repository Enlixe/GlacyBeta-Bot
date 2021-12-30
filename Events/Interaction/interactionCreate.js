const { MessageEmbed } = require('discord.js');
const { channels, colors } = require('../../Structures/config.json');

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        // ================================
        // Maintenance check
        // ================================
        if (client.maintenance && interaction.user.id != '524805915526955048') {
            const Response = new MessageEmbed()
                .setTitle('👷‍♂️ MAINTENANCE 👷‍♂️')
                .setDescription(
                    'Sorry the bot will be back shortly when everything is working correctly.'
                )
                .setColor('DARK_BUT_NOT_BLACK');

            return interaction.reply({ embeds: [Response] });
        }
        // ================================

        if (interaction.isCommand() || interaction.isContextMenu()) {
			const { guild } = interaction;

            // ================================
            // Cooldown System
            // ================================
            const { cooldown, commands } = require('../../Structures/index');
            const cmd = client.commands.get(interaction.commandName);
            if (cmd) {
                if (cmd.cooldown) {
                    const cooldwn =
                        cooldown.get(`${cmd.name}${interaction.user.id}`) -
                        Date.now();
                    const mth = Math.floor(cooldwn / 1000) + '';
                    if (cooldown.has(`${cmd.name}${interaction.user.id}`))
                        return interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('RED')
                                    .setDescription(
                                        `You are on a cooldown. Try this command again in \`${
                                            mth.split('.')[0]
                                        }\` seconds`
                                    ),
                            ],
                            ephemeral: true,
                        });
                    cooldown.set(
                        `${cmd.name}${interaction.user.id}`,
                        Date.now() + cmd.cooldown
                    );
                    setTimeout(() => {
                        cooldown.delete(`${cmd.name}${interaction.user.id}`);
                    }, cmd.cooldown);
                }
            }
            // ================================

            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return interaction
                    .reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor('RED')
                                .setDescription(
                                    '⛔ An error occured while running this command.'
                                ),
                        ],
                    })
                    .then(client.commands.delete(interaction.commandName))
                    .then(
                        console.log(
                            `EnlX > Command "${interaction.commandName}" was deleted because it was invalid`
                        )
                    );
            }

            // ================================
            // Devs only
            // ================================
            const { devs } = require('../../Structures/config.json');
            if (command.devsOnly === true) {
                if (!devs.includes(interaction.member.id))
                    return interaction.reply({
                        content: "You can't use this command!",
                        ephemeral: true,
                    });
            }

			// ================================
            // Premium check
            // ================================
			if (command.premiumOnly === true) {
				const PreDB = require('../../Structures/Schemas/PremiumModel');
				const premiumCommands = ["hentai"];
				const isCmdPremium = premiumCommands.some(commands => commands == command.name) || command.premiumOnly;

				try {
					await PreDB.findOne({ GuildID: guild.id }, async (err, data) => {
						if(err) throw err;
	
						if(data == null && isCmdPremium) 
							return interaction.reply({content: `Only servers with premium are able to use this command.`, ephemeral: true});
						
						if(data) {
							if(data.Redeemed == false && isCmdPremium)
								return interaction.reply({content: `Premium have not been redeemed yet.`, ephemeral: true});
						}
		
						return command.execute(interaction, client)
					});
				} catch (error) {
					const Logs = guild.channels.cache.get(channels.log);
					// Note: You will get a database error (MongooseError: Query was already executed:) just ignore it, the bot still works fine.
					const errorEmbed = new MessageEmbed()
					.setColor(colors.error)
					.setDescription(`⛔ Alert: ${error}`);

					Logs.send({ embeds: [errorEmbed], ephemeral: true });
				}
			} else {
				return command.execute(interaction, client);
			}
			// ================================
		}
    },
};
