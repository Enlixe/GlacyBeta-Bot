module.exports = {
	id: "Ping",
	execute(interaction) {
		interaction.reply({ content: "PONG !" });
	}
}