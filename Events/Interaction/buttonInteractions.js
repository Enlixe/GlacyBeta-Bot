const { ButtonInteraction } = require("discord.js");

module.exports = {
	name: "interactionCreate",
	/**
	 * @param {ButtonInteraction} interaction
	 */
	execute(interaction, client) {
		if(!interaction.isButton()) return;
		const button = client.buttons.get(interaction.customId);

		if (button.permission && !interaction.member.permissions.has(button.permission)) 
			return interaction.reply({content: `You don't have the permission to use this button.`, ephemeral: true});

		if(button.ownerOnly && interaction.member.id !== interaction.guild.ownerId)
			return interaction.reply({content: `You are not the owner.`, ephemeral: true});

		button.execute(interaction, client);
	}
}