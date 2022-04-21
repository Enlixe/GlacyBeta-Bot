const { CommandInteraction, MessageEmbed } = require("discord.js");
const { execute } = require("../../Events/Voice/JTC");

module.exports = {
	name: 'voice',
	description: 'Control the voice channel of a user.',
	options: [
		{
			name: 'invite',
			type: "SUB_COMMAND",
			description: "Invite a user to the voice channel.",
			options: [
				{
					name: 'user',
					type: "USER",
					required: true,
					description: "The user to invite to the voice channel.",
				}
			]
		},
		{
			name: 'disallow',
			type: "SUB_COMMAND",
			description: "Remove a user from the voice channel.",
			options: [
				{
					name: 'user',
					type: "USER",
					required: true,
					description: "The user to remove from the voice channel.",
				}
			]
		},
		{
			name: 'name',
			type: "SUB_COMMAND",
			description: "Change the name of the voice channel.",
			options: [
				{
					name: 'text',
					type: "STRING",
					required: true,
					description: "The new name of the voice channel.",
				}
			]
		},
		
		{
			name: 'public',
			type: "SUB_COMMAND",
			description: "Change the public status of the voice channel.",
			options: [
				{
					name: 'turn',
					type: "STRING",
					required: true,
					description: "Turn on or off the public status of the voice channel.",
					choices: [
						{name: "🔓 | On  / Unlock", value: "on"},
						{name: "🔒 | Off / Lock", value: "off"}
					]
				}
			]
		}
	],
	/**
	 * @param { CommandInteraction } interaction 
	 */
	async execute(interaction, client) {
		const { options, member, guild} = interaction;
		
		const subCommand = options.getSubcommand();
		const voiceChannel = member.voice.channel;
		const embed = new MessageEmbed().setColor("GREEN");
		const ownedChannel = client.voiceGenerator.get(member.id);

		if (!voiceChannel) 
			return interaction.reply({embeds: [embed.setDescription("You are not in a voice channel.").setColor("RED")], ephemeral: true});

		if(!ownedChannel || voiceChannel.id !== ownedChannel)
			return interaction.reply({embeds: [embed.setDescription("You do not own this voice channel.").setColor("RED")], ephemeral: true});

		switch(subCommand) {
			case "invite": {
				const targetUser = options.getMember("user");
				voiceChannel.permissionOverwrites.edit(targetUser, {CONNECT: true})

				await targetUser.send({embeds: [embed.setDescription(`You have been invited to the voice channel \`${voiceChannel.name}\``)]});
				interaction.reply({embeds: [embed.setDescription(`${targetUser.user.tag} has been invited to the voice channel \`${voiceChannel.name}\``)]});
			}
			break;
			case "disallow":{
				const targetUser = options.getMember("user");
				voiceChannel.permissionOverwrites.edit(targetUser, {CONNECT: false})

				if (targetUser.voice.channel && targetUser.voice.channel.id === voiceChannel.id)
					targetUser.voice.setChannel(null);
				
				await targetUser.send({embeds: [embed.setDescription(`You have been removed from the voice channel \`${voiceChannel.name}\``)]});
				interaction.reply({embeds: [embed.setDescription(`${targetUser.user.tag} has been removed from the voice channel \`${voiceChannel.name}\``)]});
			}	
			break;
			case "name":{
				const newName = options.getString("text");
				if(newName.length > 22 || newName.length < 1)
					return interaction.reply({embeds: [embed.setDescription("The name must be between 1 and 22 characters.").setColor("RED")], ephemeral: true});

				voiceChannel.edit({name: newName});
				interaction.reply({embeds: [embed.setDescription(`The name of the voice channel has been changed to **${newName}**.`)]});
			}
			break;
			case "public": {
				const turnChoice = options.getString("turn");
				switch(turnChoice) {
					case "on": {
						voiceChannel.permissionOverwrites.edit(guild.id, {CONNECT: null})
						interaction.reply({embeds: [embed.setDescription(`The voice channel is now public.`)]});
					}
					break;
					case "off": {
						voiceChannel.permissionOverwrites.edit(guild.id, {CONNECT: false})
						interaction.reply({embeds: [embed.setDescription(`The voice channel is now private.`)]});
					}
				}
			}
			break;
		}
	}
}