const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
	name: "ping",
	description: "Ping",
	usage: "/ping",
	// devsOnly: true,
	// permissions: [],
	// aliases: [],
	cooldown: 3000,
	// enabled: true,
	/**
     * @param {CommandInteraction} interaction
     */
	execute(interaction) {
		
		const row = new MessageActionRow();
		row.addComponents(
			new MessageButton()
			.setCustomId("Ping")
			.setLabel("Ping")
			.setStyle("PRIMARY")
		)

		interaction.reply({ content: "POING", components: [row] });

	},
};