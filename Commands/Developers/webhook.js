const { MessageActionRow, MessageButton, WebhookClient } = require("discord.js");

module.exports = {
	name: "webhook",
	description: "Send a webhook [HARDLY WIP]",
	usage: "/webhook test",
	devsOnly: true,
	// permissions: [],
	aliases: ["hook"],
	cooldown: 15000,
	// enabled: true,
	options: [
		{
			name: "type",
			description: "Type of webhook",
			choices: [
				{name: "text", value: "text"},
				{name: "embed", value: "embed"},
			]
		},
		{
			name: "channel",
			description: "The channel to send the webhook to",
			type: "CHANNEL"
		},
		{
			name: "content",
			description: "The content of the webhook",
			type: "STRING",
			required: true
		}
	],
	/**
     * @param {CommandInteraction} interaction
     */
	execute(interaction) {

		const { options } = interaction;
		const { type, channel, content } = options;
		content = content.replace(/\n/g, "\\n");

		webhook = await interaction.channel.createWebhook(interaction.user.name, {
			avatar_url: interaction.user.displayAvatarURL(),
		})
		await webhook.send({
			content: content
		})
		webhooks = await interaction.channel.webhooks()
		webhooks.forEach(async webhook => {
			if (webhook.name == interaction.user.name) {
				await webhook.delete()
			}
		})

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